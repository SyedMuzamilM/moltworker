import { useState, useEffect, useCallback } from 'react'
import {
  listDevices,
  approveDevice,
  approveAllDevices,
  restartGateway,
  getStorageStatus,
  triggerSync,
  listPairings,
  approvePairing,
  approveAllPairings,
  AuthError,
  type PendingDevice,
  type PairedDevice,
  type DeviceListResponse,
  type StorageStatusResponse,
  type PendingPairing,
  type PairedChannel,
  type PairingListResponse,
} from '../api'
import './AdminPage.css'

// Small inline spinner for buttons
function ButtonSpinner() {
  return <span className="btn-spinner" />
}

const CHANNELS = ['telegram', 'whatsapp', 'discord', 'slack'] as const;
type ChannelType = typeof CHANNELS[number];

export default function AdminPage() {
  const [pending, setPending] = useState<PendingDevice[]>([])
  const [paired, setPaired] = useState<PairedDevice[]>([])
  const [storageStatus, setStorageStatus] = useState<StorageStatusResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionInProgress, setActionInProgress] = useState<string | null>(null)
  const [restartInProgress, setRestartInProgress] = useState(false)
  const [syncInProgress, setSyncInProgress] = useState(false)
  
  // Channel pairings state
  const [channelPairings, setChannelPairings] = useState<Record<ChannelType, PairingListResponse | null>>({
    telegram: null,
    whatsapp: null,
    discord: null,
    slack: null,
  })
  const [pairingActionInProgress, setPairingActionInProgress] = useState<Record<string, boolean>>({})

  const fetchDevices = useCallback(async () => {
    try {
      setError(null)
      const data: DeviceListResponse = await listDevices()
      setPending(data.pending || [])
      setPaired(data.paired || [])
      
      if (data.error) {
        setError(data.error)
      } else if (data.parseError) {
        setError(`Parse error: ${data.parseError}`)
      }
    } catch (err) {
      if (err instanceof AuthError) {
        setError('Authentication required. Please log in via Cloudflare Access.')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to fetch devices')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchStorageStatus = useCallback(async () => {
    try {
      const status = await getStorageStatus()
      setStorageStatus(status)
    } catch (err) {
      // Don't show error for storage status - it's not critical
      console.error('Failed to fetch storage status:', err)
    }
  }, [])

  const fetchPairings = useCallback(async () => {
    try {
      const [telegramData, whatsappData, discordData, slackData] = await Promise.all([
        listPairings('telegram'),
        listPairings('whatsapp'),
        listPairings('discord'),
        listPairings('slack'),
      ])
      setChannelPairings({
        telegram: telegramData,
        whatsapp: whatsappData,
        discord: discordData,
        slack: slackData,
      })
    } catch (err) {
      console.error('Failed to fetch pairings:', err)
      // Don't set error state - pairings are secondary to devices
    }
  }, [])

  useEffect(() => {
    fetchDevices()
    fetchStorageStatus()
    fetchPairings()
  }, [fetchDevices, fetchStorageStatus, fetchPairings])

  const handleApprove = async (requestId: string) => {
    setActionInProgress(requestId)
    try {
      const result = await approveDevice(requestId)
      if (result.success) {
        // Refresh the list
        await fetchDevices()
      } else {
        setError(result.error || 'Approval failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve device')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleApproveAll = async () => {
    if (pending.length === 0) return
    
    setActionInProgress('all')
    try {
      const result = await approveAllDevices()
      if (result.failed && result.failed.length > 0) {
        setError(`Failed to approve ${result.failed.length} device(s)`)
      }
      // Refresh the list
      await fetchDevices()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve devices')
    } finally {
      setActionInProgress(null)
    }
  }

  const handleRestartGateway = async () => {
    if (!confirm('Are you sure you want to restart the gateway? This will disconnect all clients temporarily.')) {
      return
    }
    
    setRestartInProgress(true)
    try {
      const result = await restartGateway()
      if (result.success) {
        setError(null)
        // Show success message briefly
        alert('Gateway restart initiated. Clients will reconnect automatically.')
      } else {
        setError(result.error || 'Failed to restart gateway')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restart gateway')
    } finally {
      setRestartInProgress(false)
    }
  }

  const handleSync = async () => {
    setSyncInProgress(true)
    try {
      const result = await triggerSync()
      if (result.success) {
        // Update the storage status with new lastSync time
        setStorageStatus(prev => prev ? { ...prev, lastSync: result.lastSync || null } : null)
        setError(null)
      } else {
        setError(result.error || 'Sync failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync')
    } finally {
      setSyncInProgress(false)
    }
  }

  const formatSyncTime = (isoString: string | null) => {
    if (!isoString) return 'Never'
    try {
      const date = new Date(isoString)
      return date.toLocaleString()
    } catch {
      return isoString
    }
  }

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts)
    return date.toLocaleString()
  }

  const formatTimeAgo = (ts: number) => {
    const seconds = Math.floor((Date.now() - ts) / 1000)
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  const handleApprovePairing = async (channel: ChannelType, code: string) => {
    const actionKey = `${channel}:${code}`
    setPairingActionInProgress(prev => ({ ...prev, [actionKey]: true }))
    try {
      const result = await approvePairing(channel, code)
      if (result.success) {
        await fetchPairings()
      } else {
        setError(result.error || `Failed to approve ${channel} pairing`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to approve ${channel} pairing`)
    } finally {
      setPairingActionInProgress(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const handleApproveAllPairings = async (channel: ChannelType) => {
    const pairings = channelPairings[channel]
    if (!pairings || pairings.pending.length === 0) return

    const actionKey = `${channel}:all`
    setPairingActionInProgress(prev => ({ ...prev, [actionKey]: true }))
    try {
      const result = await approveAllPairings(channel)
      if (result.failed && result.failed.length > 0) {
        setError(`Failed to approve ${result.failed.length} ${channel} pairing(s)`)
      }
      await fetchPairings()
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to approve ${channel} pairings`)
    } finally {
      setPairingActionInProgress(prev => ({ ...prev, [actionKey]: false }))
    }
  }

  const hasAnyPairings = CHANNELS.some(channel => {
    const data = channelPairings[channel]
    return data && (data.pending.length > 0 || data.paired.length > 0)
  })

  return (
    <div className="devices-page">
      {/* Vintage Barbershop Header */}
      <header className="admin-header">
        <h1>OpenClaw Control Room</h1>
        <p className="admin-subtitle">AI Gateway Management Console</p>
      </header>

      {error && (
        <div className="error-banner">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="dismiss-btn">
            Dismiss
          </button>
        </div>
      )}

      {storageStatus && !storageStatus.configured && (
        <div className="warning-banner">
          <div className="warning-content">
            <strong>R2 Storage Not Configured</strong>
            <p>
              Paired devices and conversations will be lost when the container restarts.
              To enable persistent storage, configure R2 credentials.
              See the <a href="https://github.com/cloudflare/moltworker" target="_blank" rel="noopener noreferrer">README</a> for setup instructions.
            </p>
            {storageStatus.missing && (
              <p className="missing-secrets">
                Missing: {storageStatus.missing.join(', ')}
              </p>
            )}
          </div>
        </div>
      )}

      {storageStatus?.configured && (
        <div className="success-banner">
          <div className="storage-status">
            <div className="storage-info">
              <span>R2 storage is configured. Your data will persist across container restarts.</span>
              <span className="last-sync">
                Last backup: {formatSyncTime(storageStatus.lastSync)}
              </span>
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleSync}
              disabled={syncInProgress}
            >
              {syncInProgress && <ButtonSpinner />}
              {syncInProgress ? 'Syncing...' : 'Backup Now'}
            </button>
          </div>
        </div>
      )}

      <section className="devices-section gateway-section">
        <div className="section-header">
          <h2>Gateway Controls</h2>
          <button
            className="btn btn-danger"
            onClick={handleRestartGateway}
            disabled={restartInProgress}
          >
            {restartInProgress && <ButtonSpinner />}
            {restartInProgress ? 'Restarting...' : 'Restart Gateway'}
          </button>
        </div>
        <p className="hint">
          Restart the gateway to apply configuration changes or recover from errors.
          All connected clients will be temporarily disconnected.
        </p>
      </section>

      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading devices...</p>
        </div>
      ) : (
        <>
          <section className="devices-section">
        <div className="section-header">
          <h2>Pending Pairing Requests</h2>
          <div className="header-actions">
            {pending.length > 0 && (
              <button
                className="btn btn-primary"
                onClick={handleApproveAll}
                disabled={actionInProgress !== null}
              >
                {actionInProgress === 'all' && <ButtonSpinner />}
                {actionInProgress === 'all' ? 'Approving...' : `Approve All (${pending.length})`}
              </button>
            )}
            <button className="btn btn-secondary" onClick={fetchDevices} disabled={loading}>
              Refresh
            </button>
          </div>
        </div>

        {pending.length === 0 ? (
          <div className="empty-state">
            <p>No pending pairing requests</p>
            <p className="hint">
              Devices will appear here when they attempt to connect without being paired.
            </p>
          </div>
        ) : (
          <div className="devices-grid">
            {pending.map((device) => (
              <div key={device.requestId} className="device-card pending">
                <div className="device-header">
                  <span className="device-name">
                    {device.displayName || device.deviceId || 'Unknown Device'}
                  </span>
                  <span className="device-badge pending">Pending</span>
                </div>
                <div className="device-details">
                  {device.platform && (
                    <div className="detail-row">
                      <span className="label">Platform:</span>
                      <span className="value">{device.platform}</span>
                    </div>
                  )}
                  {device.clientId && (
                    <div className="detail-row">
                      <span className="label">Client:</span>
                      <span className="value">{device.clientId}</span>
                    </div>
                  )}
                  {device.clientMode && (
                    <div className="detail-row">
                      <span className="label">Mode:</span>
                      <span className="value">{device.clientMode}</span>
                    </div>
                  )}
                  {device.role && (
                    <div className="detail-row">
                      <span className="label">Role:</span>
                      <span className="value">{device.role}</span>
                    </div>
                  )}
                  {device.remoteIp && (
                    <div className="detail-row">
                      <span className="label">IP:</span>
                      <span className="value">{device.remoteIp}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">Requested:</span>
                    <span className="value" title={formatTimestamp(device.ts)}>
                      {formatTimeAgo(device.ts)}
                    </span>
                  </div>
                </div>
                <div className="device-actions">
                  <button
                    className="btn btn-success"
                    onClick={() => handleApprove(device.requestId)}
                    disabled={actionInProgress !== null}
                  >
                    {actionInProgress === device.requestId && <ButtonSpinner />}
                    {actionInProgress === device.requestId ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="devices-section">
        <div className="section-header">
          <h2>Paired Devices</h2>
        </div>

        {paired.length === 0 ? (
          <div className="empty-state">
            <p>No paired devices</p>
          </div>
        ) : (
          <div className="devices-grid">
            {paired.map((device, index) => (
              <div key={device.deviceId || index} className="device-card paired">
                <div className="device-header">
                  <span className="device-name">
                    {device.displayName || device.deviceId || 'Unknown Device'}
                  </span>
                  <span className="device-badge paired">Paired</span>
                </div>
                <div className="device-details">
                  {device.platform && (
                    <div className="detail-row">
                      <span className="label">Platform:</span>
                      <span className="value">{device.platform}</span>
                    </div>
                  )}
                  {device.clientId && (
                    <div className="detail-row">
                      <span className="label">Client:</span>
                      <span className="value">{device.clientId}</span>
                    </div>
                  )}
                  {device.clientMode && (
                    <div className="detail-row">
                      <span className="label">Mode:</span>
                      <span className="value">{device.clientMode}</span>
                    </div>
                  )}
                  {device.role && (
                    <div className="detail-row">
                      <span className="label">Role:</span>
                      <span className="value">{device.role}</span>
                    </div>
                  )}
                  <div className="detail-row">
                    <span className="label">Paired:</span>
                    <span className="value" title={formatTimestamp(device.approvedAtMs)}>
                      {formatTimeAgo(device.approvedAtMs)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {hasAnyPairings && (
        <section className="devices-section channel-pairings-section">
          <div className="section-header">
            <h2>Channel Pairings</h2>
            <button className="btn btn-secondary" onClick={fetchPairings}>
              Refresh
            </button>
          </div>

          {CHANNELS.map(channel => {
            const data = channelPairings[channel]
            if (!data) return null

            const hasPending = data.pending.length > 0
            const hasPaired = data.paired.length > 0

            if (!hasPending && !hasPaired) return null

            return (
              <div key={channel} className="channel-section">
                <h3 className="channel-title">
                  {channel.charAt(0).toUpperCase() + channel.slice(1)}
                </h3>

                {hasPending && (
                  <div className="channel-subsection">
                    <div className="subsection-header">
                      <h4>Pending ({data.pending.length})</h4>
                      {data.pending.length > 0 && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleApproveAllPairings(channel)}
                          disabled={pairingActionInProgress[`${channel}:all`]}
                        >
                          {pairingActionInProgress[`${channel}:all`] && <ButtonSpinner />}
                          {pairingActionInProgress[`${channel}:all`] ? 'Approving...' : 'Approve All'}
                        </button>
                      )}
                    </div>
                    <div className="devices-grid">
                      {data.pending.map((pairing) => (
                        <div key={pairing.code} className="device-card pending">
                          <div className="device-header">
                            <span className="device-name">
                              {pairing.displayName || pairing.id || pairing.code}
                            </span>
                            <span className="device-badge pending">Pending</span>
                          </div>
                          <div className="device-details">
                            {pairing.id && (
                              <div className="detail-row">
                                <span className="label">ID:</span>
                                <span className="value">{pairing.id}</span>
                              </div>
                            )}
                            {pairing.code && (
                              <div className="detail-row">
                                <span className="label">Code:</span>
                                <span className="value">{pairing.code}</span>
                              </div>
                            )}
                            <div className="detail-row">
                              <span className="label">Requested:</span>
                              <span className="value" title={formatTimestamp(pairing.ts)}>
                                {formatTimeAgo(pairing.ts)}
                              </span>
                            </div>
                          </div>
                          <div className="device-actions">
                            <button
                              className="btn btn-success"
                              onClick={() => handleApprovePairing(channel, pairing.code)}
                              disabled={pairingActionInProgress[`${channel}:${pairing.code}`]}
                            >
                              {pairingActionInProgress[`${channel}:${pairing.code}`] && <ButtonSpinner />}
                              {pairingActionInProgress[`${channel}:${pairing.code}`] ? 'Approving...' : 'Approve'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {hasPaired && (
                  <div className="channel-subsection">
                    <h4 className="subsection-title">Paired ({data.paired.length})</h4>
                    <div className="devices-grid">
                      {data.paired.map((pairing, index) => (
                        <div key={pairing.code || index} className="device-card paired">
                          <div className="device-header">
                            <span className="device-name">
                              {pairing.displayName || pairing.id || pairing.code}
                            </span>
                            <span className="device-badge paired">Paired</span>
                          </div>
                          <div className="device-details">
                            {pairing.id && (
                              <div className="detail-row">
                                <span className="label">ID:</span>
                                <span className="value">{pairing.id}</span>
                              </div>
                            )}
                            {pairing.code && (
                              <div className="detail-row">
                                <span className="label">Code:</span>
                                <span className="value">{pairing.code}</span>
                              </div>
                            )}
                            <div className="detail-row">
                              <span className="label">Paired:</span>
                              <span className="value" title={formatTimestamp(pairing.approvedAtMs)}>
                                {formatTimeAgo(pairing.approvedAtMs)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </section>
      )}
        </>
      )}
    </div>
  )
}
