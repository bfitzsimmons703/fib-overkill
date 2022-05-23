import React, { FormEvent, useRef, useState } from 'react';
import Head from 'next/head';
import axios, { AxiosError } from 'axios';
import styles from '../styles/Home.module.css';
import { NextPage } from 'next';

enum Status {
    PENDING = 1,
    SUCCESS = 2,
    FAILED = 3,
}

interface FibResponse {
    status: Status;
    value?: number;
}

interface ApiErrorDetail {
    ctx: any;
    loc: string[];
    msg: string;
    type: string;
}

interface ApiError {
    detail: ApiErrorDetail[];
}

const Home: NextPage = () => {
    const [inputValue, setInputValue] = useState(0);
    const [fibValue, setFibValue] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const pollTimeout = useRef<NodeJS.Timer>();

    const handleInput = (e: FormEvent<HTMLInputElement>) => {
        if (e.currentTarget.value == '') return;

        const int: number = parseInt(e.currentTarget.value, 10);
        if (int < 0) {
            setInputValue(0);
        } else {
            setInputValue(int);
        }
    };

    const submitInputValue = async () => {
        setLoading(false);
        setError('');
        setFibValue(null);
        clearTimeout(pollTimeout.current);

        try {
            const { data } = await axios.get(`/api/fib?n=${inputValue}`);
            let response = data as FibResponse;
            switch (response.status) {
                case Status.PENDING:
                    pollTimeout.current = setTimeout(submitInputValue, 1000);
                    setLoading(true);
                    break;
                case Status.SUCCESS:
                    setFibValue(response.value!);
                    break;
                case Status.FAILED:
                    setFibValue(null);
                    setError(
                        'Oops! Something went wrong. Please refresh and try again.'
                    );
                    break;
            }
        } catch (error) {
            try {
                const axiosError = error as AxiosError;
                if (axiosError.response?.data) {
                    let apiError = axiosError.response.data as ApiError;
                    setError(apiError.detail[0].msg);
                }
            } catch (_e) {
                setError(
                    'Oops! Something went wrong. Please refresh and try again.'
                );
            }
        }
    };

    return (
        <div className={styles.container}>
            <Head>
                <title>Fib Overkill</title>
                <meta
                    name='description'
                    content='Calculate the nth number in the Fibonacci Sequence'
                />
                <link rel='icon' href='/favicon.ico' />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Fibonacci Overkill</h1>

                <p className={styles.description}>
                    The most over-engineered Fibonacci calculator
                </p>

                <div className={styles.grid}>
                    <input
                        type='number'
                        value={inputValue}
                        onInput={handleInput}
                    />
                    <input
                        type='button'
                        value='Enter'
                        onClick={submitInputValue}
                    />
                </div>

                <div style={{ marginTop: 20 }}>
                    {fibValue !== null && <div>Fib Value: {fibValue}</div>}

                    {!!loading && <div>Loading...</div>}

                    {error !== '' && (
                        <div style={{ color: 'red' }}>{error}</div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;
