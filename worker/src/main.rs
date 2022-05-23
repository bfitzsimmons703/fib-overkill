use std::{sync::mpsc, thread, time::Duration};

use redis::{Commands, RedisResult};

static REDIS_URL: &str = "redis://worker-queue:6379";
static QUEUE_KEY: &str = "queue:process_fib";
static FIB_KEY: &str = "fib_values";
static NUM_THREADS: u8 = 3;

#[derive(Debug)]
struct FibResult {
    idx: i32,
    fib_val: i32,
}

fn main() {
    let client = redis::Client::open(REDIS_URL).unwrap();
    let (sender, receiver) = mpsc::channel();

    for thread_id in 1..=NUM_THREADS {
        let mut con = client.get_connection().unwrap();
        let sender = sender.clone();

        thread::spawn(move || loop {
            match con.blpop::<&str, Vec<String>>(QUEUE_KEY, 300) {
                Ok(value) => {
                    if let Some(value) = value.get(1) {
                        if let Ok(value) = value.parse::<i32>() {
                            let fib_value = fib(value);
                            let msg = FibResult {
                                idx: value,
                                fib_val: fib_value,
                            };
                            let _ = sender.send(msg);
                            println!(
                                "Calculated fib for {} on thread {}. Sleeping for 10 seconds",
                                value, thread_id
                            );
                            thread::sleep(Duration::from_secs(10));
                        } else {
                            println!("Could not parse value on thread {}: {}", thread_id, value);
                        }
                    } else {
                        println!("Timed out, restarting loop on thread {}", thread_id);
                    }
                }
                Err(e) => {
                    println!("RedisError on thread {}: {}", thread_id, e);
                }
            }
        });
    }

    let mut con = client.get_connection().unwrap();
    while let Ok(msg) = receiver.recv() {
        println!("GOT RESULT: {:?}", msg);
        let result: RedisResult<i32> = con.hset(FIB_KEY, msg.idx, msg.fib_val);
        if let Err(err) = result {
            println!("Error setting hash value: {}", err);
        }

        let _: RedisResult<usize> = con.expire(FIB_KEY, 30);
    }
}

fn fib(n: i32) -> i32 {
    match n {
        0..=1 => n,
        _ => fib(n - 1) + fib(n - 2),
    }
}
