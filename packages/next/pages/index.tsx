import * as metaplex from "@metaplex/js";
import { MetadataData } from "@metaplex/js/lib/programs/metadata";
import { Connection, PublicKey } from '@solana/web3.js';
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react';
import styles from '../styles/Home.module.css'

declare global {
  interface Window {
    solana: any;
  }
}

const Home: NextPage = () => {
  const [tokens, setTokens] = useState<Array<{
    address: string,
    metadata: {
      name: string,
      description: string,
      image: string,
      external_url: string,
    }
  }>>([]);

  const [walletConnected, setWalletConnected] = useState(false);

  const creator = "9doSyLpnDtAB4R1CVmKjwqUWP6oJ8huB1SSJksthYPS";

  const connectWallet = useCallback(() => {
    window.solana.connect().then(({ publicKey }: { publicKey: Symbol}) => {
      setWalletConnected(true);
      fetch(`/api/tokens?address=${publicKey.toString()}&creator=${creator}`).then(res => res.json()).then(tokens => {
        setTokens(tokens);
      });
    });
  }, []);

  useEffect(() => {  
    // Will either automatically connect to Phantom, or do nothing.
    window.solana.connect({ onlyIfTrusted: true }).then(({ publicKey }: { publicKey: Symbol}) => {
      setWalletConnected(true);
        fetch(`/api/tokens?address=${publicKey.toString()}&creator=${creator}`).then(res => res.json()).then(tokens => {
          setTokens(tokens);
        });
      }).catch(() => {
        window.solana.connect().then(({ publicKey }: { publicKey: Symbol}) => {
          setWalletConnected(true);
          fetch(`/api/tokens?address=${publicKey.toString()}&creator=${creator}`).then(res => res.json()).then(tokens => {
            setTokens(tokens);
          });
        });
      });
  }, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Sol Souls Afterlife</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Sol Souls Afterlife
        </h1>


        <p className={styles.description}>
            <a href="#connect" onClick={connectWallet} style={{color: "#0070f3" }}>Connect your phantom wallet</a> to bind your wallet address.
        </p>

        <div className={styles.grid}>
          {tokens.map(token => (
            <div className={styles.card} key={token.address}>
              <h3>{token.metadata.name}</h3>
              <img src={token.metadata.image} alt={token.metadata.name} width={200} height={200} />
            </div>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <span className={styles.logo}>
            <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
          </span>
        </a>
      </footer>
    </div>
  )
}

export default Home;
