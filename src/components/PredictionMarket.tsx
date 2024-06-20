import React, { useState } from 'react';
import './PredictionMarket.css';
import { usePredictionMarketContract } from '../hooks/usePredictionMarketContract';
import { useUserBetContract } from '../hooks/useUserBetContract';
import { fromNano } from '@ton/core';
import { Skeleton } from 'antd';
import Modal from './internal/Modal';
import { Filter } from '../models/filter';
import usdtIcon from "./../assets/usdt-icon.svg";

interface PredictionMarketProps {
  key: number;
  marketFactoryContractAddress: string;
  seqno: number;
  filter: Filter;
}

const PredictionMarket: React.FC<PredictionMarketProps> = ({ marketFactoryContractAddress, seqno, filter }) => {
  const MAX_RETRY_AMOUNT = import.meta.env.VITE_PREDICTION_MARKET_RETRY_COUNT
  const { currentAttempt, address, predictionMarketDetails, placeUserBet } = usePredictionMarketContract(marketFactoryContractAddress, seqno);
  const { userBet, claimWinnings } = useUserBetContract(address!);
  const [bet, setBet] = useState(0);
  const [outcomeText, setOutcomeText] = useState("");
  const [outcome, setOutcome] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);

  if (currentAttempt === MAX_RETRY_AMOUNT) {
    return;
  }

  if (!predictionMarketDetails || !address) {
    return <Skeleton active />;
  }

  const eventEnded = new Date(Number(predictionMarketDetails.endTime) * 1000) <= new Date();
  const endTimeString = new Date(Number(predictionMarketDetails.endTime) * 1000).toLocaleString();
  
  if(!!filter.searchQuery && !predictionMarketDetails.eventDescription.includes(filter.searchQuery)) {
    return;
  }
  
  if(filter.eventType && filter.eventType !== "All" && predictionMarketDetails.eventType !== filter.eventType) {
    return;
  }

  const handleClaim = () => {
    claimWinnings();
  };

  const handleBet = () => {
    console.log(bet, outcome);
    placeUserBet(bet, Number(outcome));
    setModalVisible(false);
  };

  const openBetModal = (outcome: string) => {
    setOutcomeText(outcome);
    setOutcome(outcome === predictionMarketDetails.outcomeName1 ? 0 : 1);
    setModalVisible(true);
  };

  const closeBetModal = () => {
    setModalVisible(false);
  };

  return (
    <div className="market-card">
      <h2>{predictionMarketDetails.eventDescription}</h2>
      <div className="market-content">
        <div className="info-row-group">
          <div className="info-row">
              <span className="info-title">End Time:</span>
              <span className="info-value white-text">{endTimeString}</span>
          </div>
          <div className="info-row">
              <span className="info-title">Outcome 1:</span>
              <span className="info-value blue-text">{predictionMarketDetails.outcomeName1}</span>
          </div>
          <div className="info-row">
              <span className="info-title">Outcome 2:</span>
              <span className="info-value red-text">{predictionMarketDetails.outcomeName2}</span>
          </div>
        </div>
        <div className="market-controls">
          {eventEnded ? (
             predictionMarketDetails.resolved && userBet ? (
              <div className="claim-section">
                <label className="claim-label">Claim Amount:</label>
                <div className="claim-amount">{fromNano(Number(userBet?.betAmount))}</div>
                <button onClick={handleClaim} disabled={Number(userBet?.betAmount) === 0}>Claim</button>
              </div>
             ) : (
              <p>Wait until host resolve the market</p>
             )
          ) : (
            <div className="bet-buttons">
              <button className="outcome-one-button" type="button" value="0" onClick={() => openBetModal(predictionMarketDetails.outcomeName1)}>Bet on #1</button>
              <button className="outcome-two-button" type="button" value="1" onClick={() => openBetModal(predictionMarketDetails.outcomeName2)}>Bet on #2</button>
            </div>
          )}
        </div>
      </div>
      <Modal visible={modalVisible} onClose={closeBetModal}>
        <h2>{predictionMarketDetails.eventDescription}</h2>
        <div className="info-row">
            <span className="info-title">End Time:</span>
            <span className="info-value">{endTimeString}</span>
        </div>
        <div className="info-row">
            <span className="info-title">Your Outcome:</span>
            <span className="info-value">{outcomeText}</span>
        </div>
        <div className="bet-input">
        <div className="custom-input">
              <input className="main-input" type="number" placeholder='10' value={bet} onChange={(e) => setBet(Number(e.target.value))}/>
              <div className="separator"></div>
              <div className="select-container">
                <img src={usdtIcon} alt="USDT Icon" className="currency-icon"/>
                <select>
                    <option value="USDT">USDT</option>
                    <option value="BTC">BTC</option>
                    <option value="ETH">ETH</option>
                </select>
              </div>
          </div>
        </div>
        <button className="bet-button" onClick={() => handleBet()}>Bet</button>
      </Modal>
    </div>
  );
};

export default PredictionMarket;