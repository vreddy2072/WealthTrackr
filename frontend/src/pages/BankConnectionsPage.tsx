import React, { useState, useEffect } from 'react';
import { BankConnection, bankConnectionsApi, accountsApi, Account } from '../lib/api';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Loader2, AlertCircle, RefreshCw, Link, Unlink } from 'lucide-react';
import { formatDate } from '../lib/utils';
import BankConnectionModal from '../components/accounts/BankConnectionModal';

const BankConnectionsPage: React.FC = () => {
  const [connections, setConnections] = useState<BankConnection[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingConnection, setSyncingConnection] = useState<string | null>(null);
  const [isBankConnectionModalOpen, setIsBankConnectionModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch bank connections
      const connectionsData = await bankConnectionsApi.getAll();
      setConnections(connectionsData);
      
      // Fetch accounts
      const accountsData = await accountsApi.getAll();
      setAccounts(accountsData);
      
      setLoading(false);
    } catch (err) {
      setError('Failed to load bank connections. Please try again.');
      console.error('Error fetching bank connections:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSyncConnection = async (connectionId: string) => {
    try {
      setSyncingConnection(connectionId);
      
      // Get all accounts linked to this connection
      const connection = connections.find(c => c.id === connectionId);
      if (!connection) return;
      
      // Sync each account
      for (const accountId of connection.connected_accounts) {
        await bankConnectionsApi.syncAccountTransactions(connectionId, accountId);
      }
      
      // Refresh the data
      await fetchData();
    } catch (err) {
      setError(`Failed to sync connection: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error syncing connection:', err);
    } finally {
      setSyncingConnection(null);
    }
  };

  const handleDisconnect = async (connectionId: string) => {
    if (!window.confirm('Are you sure you want to disconnect this bank connection? This will remove automatic updates for all linked accounts.')) {
      return;
    }
    
    try {
      await bankConnectionsApi.delete(connectionId);
      await fetchData();
    } catch (err) {
      setError(`Failed to disconnect bank: ${err instanceof Error ? err.message : 'Unknown error'}`);
      console.error('Error disconnecting bank:', err);
    }
  };

  const handleConnectionSuccess = () => {
    fetchData();
  };

  const getConnectionStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getAccountsForConnection = (connectionId: string) => {
    const connection = connections.find(c => c.id === connectionId);
    if (!connection) return [];
    
    return accounts.filter(account => connection.connected_accounts.includes(account.id));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Bank Connections</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Bank Connections</h1>
        <Button onClick={() => setIsBankConnectionModalOpen(true)}>
          <Link className="mr-2 h-4 w-4" /> Connect a Bank
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-800 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {connections.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No Bank Connections</CardTitle>
            <CardDescription>
              Connect your bank accounts to automatically import transactions and keep your balances up to date.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <div className="bg-primary/10 p-4 rounded-full mb-4">
              <Link className="h-8 w-8 text-primary" />
            </div>
            <p className="text-center text-muted-foreground mb-4">
              You haven't connected any banks yet. Connect your bank to automatically import transactions.
            </p>
            <Button onClick={() => setIsBankConnectionModalOpen(true)}>
              Connect a Bank
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {connections.map((connection) => {
            const linkedAccounts = getAccountsForConnection(connection.id);
            
            return (
              <Card key={connection.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>{connection.institution.name}</CardTitle>
                    {getConnectionStatusBadge(connection.status)}
                  </div>
                  <CardDescription>
                    Last synced: {connection.last_sync_at ? formatDate(connection.last_sync_at) : 'Never'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Linked Accounts</h3>
                  {linkedAccounts.length > 0 ? (
                    <ul className="space-y-2">
                      {linkedAccounts.map((account) => (
                        <li key={account.id} className="flex items-center justify-between">
                          <span>{account.name}</span>
                          <Badge variant="outline">{account.type}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No accounts linked</p>
                  )}
                  
                  {connection.error_message && (
                    <div className="mt-4 bg-red-50 p-3 rounded-md text-red-800 text-sm">
                      <p className="font-medium">Error</p>
                      <p>{connection.error_message}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSyncConnection(connection.id)}
                    disabled={syncingConnection === connection.id}
                  >
                    {syncingConnection === connection.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" /> Sync Now
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-500"
                    onClick={() => handleDisconnect(connection.id)}
                    disabled={syncingConnection === connection.id}
                  >
                    <Unlink className="mr-2 h-4 w-4" /> Disconnect
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
      
      {/* Bank Connection Modal */}
      <BankConnectionModal
        isOpen={isBankConnectionModalOpen}
        onClose={() => setIsBankConnectionModalOpen(false)}
        onSuccess={handleConnectionSuccess}
      />
    </div>
  );
};

export default BankConnectionsPage;
