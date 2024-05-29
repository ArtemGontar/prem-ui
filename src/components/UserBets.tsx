// src/components/UserBets.tsx
import React from 'react';
import { useMarketFactoryContract } from '../hooks/useMarketFactoryContract';
import UserBet from './UserBet';
import './UserBets.css';
import Loader from "react-js-loader";

const UserBets: React.FC = () => {
  const { predictionMarketDetailsArray } = useMarketFactoryContract();

  if (!predictionMarketDetailsArray) {
    return <Loader type="spinner-default" bgColor="#000" color="#000" title={"Loading..."} size={100} />;
  }

  return (
    <div className="place-bets">
      {predictionMarketDetailsArray.map((details, index) => (
        <UserBet key={index} predictionMarketDetails={details} />
      ))}
    </div>
  );
};

export default UserBets;