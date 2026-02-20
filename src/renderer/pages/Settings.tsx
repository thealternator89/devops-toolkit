import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [azureOrg, setAzureOrg] = useState('');
  const [azureProject, setAzureProject] = useState('');
  const [azurePat, setAzurePat] = useState('');
  const [copilotToken, setCopilotToken] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Load existing settings via IPC (to be implemented)
    const loadSettings = async () => {
      try {
        const settings = await (window as any).electronAPI.getSettings();
        if (settings) {
          setAzureOrg(settings.azureOrg || '');
          setAzureProject(settings.azureProject || '');
          setAzurePat(settings.azurePat || '');
          setCopilotToken(settings.copilotToken || '');
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await (window as any).electronAPI.saveSettings({
        azureOrg,
        azureProject,
        azurePat,
        copilotToken
      });
      setStatusMessage('Settings saved successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      setStatusMessage('Error saving settings.');
      console.error(error);
    }
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate('/')}>
          <i className="fas fa-arrow-left me-2"></i>
          Back to Menu
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white">
          <h4 className="mb-0">Settings</h4>
        </div>
        <div className="card-body">
          {statusMessage && (
            <div className={`alert ${statusMessage.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
              {statusMessage}
            </div>
          )}
          
          <form onSubmit={handleSave}>
            <h5 className="mb-3 border-bottom pb-2">Azure DevOps Configuration</h5>
            <div className="mb-3">
              <label className="form-label">Organization URL</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="https://dev.azure.com/your-org" 
                value={azureOrg}
                onChange={(e) => setAzureOrg(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Project Name</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="YourProject" 
                value={azureProject}
                onChange={(e) => setAzureProject(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="form-label">Personal Access Token (PAT)</label>
              <input 
                type="password" 
                className="form-control" 
                value={azurePat}
                onChange={(e) => setAzurePat(e.target.value)}
              />
            </div>

            <h5 className="mb-3 border-bottom pb-2">GitHub Copilot Configuration</h5>
            <div className="mb-4">
              <label className="form-label">Copilot API Token</label>
              <input 
                type="password" 
                className="form-control" 
                value={copilotToken}
                onChange={(e) => setCopilotToken(e.target.value)}
              />
              <div className="form-text">Your Copilot session or API token for authentication.</div>
            </div>

            <button type="submit" className="btn btn-primary">
              <i className="fas fa-save me-2"></i>
              Save Settings
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
