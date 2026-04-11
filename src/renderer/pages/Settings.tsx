import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCopilotModels } from '../hooks/useCopilotModels';
import ModelDropdown from '../components/ModelDropdown';

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [azureOrg, setAzureOrg] = useState('');
  const [azureProject, setAzureProject] = useState('');
  const [savedAzureOrg, setSavedAzureOrg] = useState('');
  const [savedAzureProject, setSavedAzureProject] = useState('');
  const [azureAuthStatus, setAzureAuthStatus] = useState({
    isAuthenticated: false,
  });
  const [checkingAzure, setCheckingAzure] = useState(false);
  const [copilotToken, setCopilotToken] = useState('');
  const [confluenceUrl, setConfluenceUrl] = useState('');
  const [confluenceUser, setConfluenceUser] = useState('');
  const [confluenceToken, setConfluenceToken] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(false);
  const { models, selectedModel, setSelectedModel, loadingModels } =
    useCopilotModels();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settings = await (window as any).electronAPI.getSettings();
        if (settings) {
          setAzureOrg(settings.azureOrg || '');
          setAzureProject(settings.azureProject || '');
          setSavedAzureOrg(settings.azureOrg || '');
          setSavedAzureProject(settings.azureProject || '');
          setCopilotToken(settings.copilotToken || '');
          setConfluenceUrl(settings.confluenceUrl || '');
          setConfluenceUser(settings.confluenceUser || '');
          setConfluenceToken(settings.confluenceToken || '');
        }

        const status = await (window as any).electronAPI.getAzureStatus();
        setAzureAuthStatus(status);
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
        azureOrg: azureOrg,
        azureProject: azureProject,
        copilotToken: copilotToken,
        copilotModel: selectedModel,
        confluenceUrl: confluenceUrl,
        confluenceUser: confluenceUser,
        confluenceToken: confluenceToken,
      });
      setSavedAzureOrg(azureOrg);
      setSavedAzureProject(azureProject);
      setStatusMessage('Settings saved successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (error) {
      setStatusMessage('Error saving settings.');
      console.error(error);
    }
  };

  const handleAzureLogin = async () => {
    try {
      setCheckingAzure(true);
      await (window as any).electronAPI.azureLogin();
      const status = await (window as any).electronAPI.getAzureStatus();
      setAzureAuthStatus(status);
    } catch (error) {
      console.error('Azure login failed:', error);
      setStatusMessage('Azure login failed. Check console for details.');
    } finally {
      setCheckingAzure(false);
    }
  };

  const handleAzureLogout = async () => {
    await (window as any).electronAPI.azureLogout();
    setAzureAuthStatus({ isAuthenticated: false });
  };

  const handleCheckAuth = async () => {
    try {
      setCheckingAuth(true);
      setAuthStatus(null);
      const res = await (window as any).electronAPI.checkCopilotAuth();
      setAuthStatus(res);
    } catch (error: any) {
      setAuthStatus({ error: error.message || 'Unknown error' });
    } finally {
      setCheckingAuth(false);
    }
  };

  return (
    <div className="container mt-4">
      <div className="mb-4">
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={() => navigate('/')}
        >
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
            <div
              className={`alert ${statusMessage.includes('Error') ? 'alert-danger' : 'alert-success'}`}
            >
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSave}>
            <h5 className="mb-3 border-bottom pb-2">
              Azure DevOps Configuration
            </h5>
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
              <label className="form-label d-block">Authentication</label>
              {azureAuthStatus.isAuthenticated ? (
                <div className="d-flex align-items-center">
                  <span className="badge bg-success me-3 p-2">
                    <i className="fas fa-check-circle me-1"></i> Authenticated
                  </span>
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm"
                    onClick={handleAzureLogout}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={handleAzureLogin}
                    disabled={
                      checkingAzure ||
                      !azureOrg ||
                      !azureProject ||
                      azureOrg !== savedAzureOrg ||
                      azureProject !== savedAzureProject
                    }
                  >
                    {checkingAzure ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="fab fa-microsoft me-2"></i>Sign In with
                        Microsoft
                      </>
                    )}
                  </button>
                  {(!azureOrg ||
                    !azureProject ||
                    azureOrg !== savedAzureOrg ||
                    azureProject !== savedAzureProject) && (
                    <div className="form-text text-danger mt-1 small">
                      <i className="fas fa-exclamation-triangle me-1"></i>
                      Please enter and <strong>Save</strong> settings to enable
                      Sign In.
                    </div>
                  )}
                </>
              )}
            </div>

            <h5 className="mb-3 border-bottom pb-2 mt-4">
              Confluence Configuration
            </h5>
            <div className="mb-3">
              <label className="form-label">Confluence URL</label>
              <input
                type="text"
                className="form-control"
                placeholder="https://your-domain.atlassian.net/wiki"
                value={confluenceUrl}
                onChange={(e) => setConfluenceUrl(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email / User (Optional)</label>
              <input
                type="text"
                className="form-control"
                placeholder="user@example.com"
                value={confluenceUser}
                onChange={(e) => setConfluenceUser(e.target.value)}
              />
              <div className="form-text">
                Leave blank if using a Personal Access Token (Bearer Auth).
                Enter email if using an Atlassian API Token (Basic Auth).
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label">API Token</label>
              <input
                type="password"
                className="form-control"
                value={confluenceToken}
                onChange={(e) => setConfluenceToken(e.target.value)}
              />
              <div className="form-text">
                Your API token or Personal Access Token (PAT).
              </div>
            </div>

            <h5 className="mb-3 border-bottom pb-2 mt-4">
              GitHub Copilot Configuration
            </h5>
            <div className="mb-3">
              <label className="form-label">Copilot API Token</label>
              <input
                type="password"
                className="form-control"
                value={copilotToken}
                onChange={(e) => setCopilotToken(e.target.value)}
              />
              <div className="form-text">
                Your Copilot session or API token for authentication.
              </div>
            </div>
            <div className="mb-4">
              <label className="form-label">Default Model</label>
              <ModelDropdown
                models={models}
                selectedModel={selectedModel}
                onSelect={setSelectedModel}
                loading={loadingModels}
                className="w-25"
                buttonVariant="outline-secondary"
              />
            </div>

            <div className="mb-4 p-3 bg-light rounded border">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">Copilot CLI Status</h6>
                <button
                  type="button"
                  className="btn btn-outline-info btn-sm"
                  onClick={handleCheckAuth}
                  disabled={checkingAuth}
                >
                  {checkingAuth ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Checking...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sync-alt me-2"></i>Check Status
                    </>
                  )}
                </button>
              </div>

              {authStatus && (
                <div
                  className={`alert mt-2 mb-0 ${authStatus.error || !authStatus.authStatus?.isAuthenticated ? 'alert-danger' : 'alert-success'}`}
                >
                  {authStatus.error ? (
                    <div>
                      <strong>Error:</strong> {authStatus.error}
                    </div>
                  ) : (
                    <>
                      <div>
                        <strong>Authenticated:</strong>{' '}
                        {authStatus.authStatus?.isAuthenticated ? 'Yes' : 'No'}
                      </div>
                      {authStatus.authStatus?.isAuthenticated && (
                        <>
                          <div>
                            <strong>User:</strong>{' '}
                            {authStatus.authStatus?.login}
                          </div>
                          <div>
                            <strong>Auth Type:</strong>{' '}
                            {authStatus.authStatus?.authType}
                          </div>
                          <div>
                            <strong>Message:</strong>{' '}
                            {authStatus.authStatus?.statusMessage}
                          </div>
                          {authStatus.status && (
                            <div className="mt-2 text-muted small">
                              CLI Version: {authStatus.status.version} v
                              {authStatus.status.protocolVersion}
                            </div>
                          )}
                        </>
                      )}
                    </>
                  )}
                </div>
              )}
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
