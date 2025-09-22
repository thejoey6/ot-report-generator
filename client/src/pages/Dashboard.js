import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import TemplateManager from '../components/TemplateManager';
import useTemplates from "../hooks/useTemplates";
import Modal from '../components/Modal';
import NewReport from '../components/ReportGenerator/NewReport';


function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const templates = useTemplates(); // hook

  return (
      <div>
        <h1>Welcome to the Dashboard of Report Generator </h1>
        <Header />
        <TemplateManager />
        
        <button onClick={() => setIsModalOpen(true)}>New Report</button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <NewReport templates={templates} onClose={() => setIsModalOpen(false)} navigate={navigate} />
        </Modal>
      </div>
  );
}

export default Dashboard;