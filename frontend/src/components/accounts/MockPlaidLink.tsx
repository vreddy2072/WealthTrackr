import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

// Mock banks for simulation - using 'ins_' prefix to match backend format
const MOCK_BANKS = [
  { id: 'ins_1', name: 'Chase', logo: '🏦' },
  { id: 'ins_2', name: 'Bank of America', logo: '🏦' },
  { id: 'ins_3', name: 'Wells Fargo', logo: '🏦' },
  { id: 'ins_4', name: 'Citibank', logo: '🏦' },
  { id: 'ins_5', name: 'Capital One', logo: '🏦' },
  { id: 'ins_6', name: 'American Express', logo: '💳' },
  { id: 'ins_7', name: 'Discover', logo: '💳' },
  { id: 'ins_8', name: 'US Bank', logo: '🏦' },
];

// Mock accounts for simulation
const MOCK_ACCOUNTS = {
  'ins_1': [
    { id: 'chase-checking', name: 'Chase Checking', type: 'depository', subtype: 'checking', balances: { current: 2500.75, iso_currency_code: 'USD' } },
    { id: 'chase-savings', name: 'Chase Savings', type: 'depository', subtype: 'savings', balances: { current: 10000.50, iso_currency_code: 'USD' } },
    { id: 'chase-credit', name: 'Chase Sapphire', type: 'credit', subtype: 'credit card', balances: { current: -450.25, iso_currency_code: 'USD' } }
  ],
  'ins_2': [
    { id: 'bofa-checking', name: 'BofA Checking', type: 'depository', subtype: 'checking', balances: { current: 1800.25, iso_currency_code: 'USD' } },
    { id: 'bofa-savings', name: 'BofA Savings', type: 'depository', subtype: 'savings', balances: { current: 5000.00, iso_currency_code: 'USD' } }
  ],
  'ins_5': [
    { id: 'capital-checking', name: 'Capital One 360 Checking', type: 'depository', subtype: 'checking', balances: { current: 3200.50, iso_currency_code: 'USD' } },
    { id: 'capital-savings', name: 'Capital One 360 Savings', type: 'depository', subtype: 'savings', balances: { current: 7500.25, iso_currency_code: 'USD' } },
    { id: 'capital-credit', name: 'Capital One Venture', type: 'credit', subtype: 'credit card', balances: { current: -1200.75, iso_currency_code: 'USD' } }
  ],
  'ins_6': [
    { id: 'amex-platinum', name: 'Amex Platinum', type: 'credit', subtype: 'credit card', balances: { current: -2500.00, iso_currency_code: 'USD' } },
    { id: 'amex-gold', name: 'Amex Gold', type: 'credit', subtype: 'credit card', balances: { current: -750.50, iso_currency_code: 'USD' } }
  ]
};

interface MockPlaidLinkProps {
  onSuccess: (publicToken: string, metadata: any) => void;
  onExit: () => void;
  children: React.ReactNode;
}

const MockPlaidLink: React.FC<MockPlaidLinkProps> = ({ onSuccess, onExit, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'select-bank' | 'enter-credentials' | 'loading'>('select-bank');
  const [selectedBank, setSelectedBank] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleOpenPlaid = () => {
    setIsOpen(true);
    setStep('select-bank');
    setSelectedBank(null);
    setUsername('');
    setPassword('');
  };

  const handleSelectBank = (bankId: string) => {
    setSelectedBank(bankId);
    setStep('enter-credentials');
  };

  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');

    // Simulate loading time
    setTimeout(() => {
      if (selectedBank && MOCK_ACCOUNTS[selectedBank as keyof typeof MOCK_ACCOUNTS]) {
        const bank = MOCK_BANKS.find(b => b.id === selectedBank);
        const accounts = MOCK_ACCOUNTS[selectedBank as keyof typeof MOCK_ACCOUNTS];

        // Generate a mock public token
        const mockPublicToken = 'mock-public-token-' + Date.now();

        onSuccess(mockPublicToken, {
          institution: {
            name: bank?.name || 'Unknown Bank',
            institution_id: selectedBank
          },
          accounts: accounts,
          public_token: mockPublicToken
        });

        setIsOpen(false);
      } else {
        // If bank not found in our mock data, use a default
        // Generate a mock public token
        const mockPublicToken = 'mock-public-token-' + Date.now();

        onSuccess(mockPublicToken, {
          institution: {
            name: 'Demo Bank',
            institution_id: 'ins_10'
          },
          accounts: [
            { id: 'demo-checking', name: 'Demo Checking', type: 'depository', subtype: 'checking', balances: { current: 1000, iso_currency_code: 'USD' } },
            { id: 'demo-savings', name: 'Demo Savings', type: 'depository', subtype: 'savings', balances: { current: 5000, iso_currency_code: 'USD' } }
          ],
          public_token: mockPublicToken
        });

        setIsOpen(false);
      }
    }, 2000);
  };

  const handleCancel = () => {
    setIsOpen(false);
    onExit();
  };

  return (
    <>
      <Button onClick={handleOpenPlaid} className="w-full">
        {children}
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) handleCancel();
        setIsOpen(open);
      }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {step === 'select-bank' && 'Select Your Bank'}
              {step === 'enter-credentials' && 'Enter Your Credentials'}
              {step === 'loading' && 'Connecting...'}
            </DialogTitle>
            <DialogDescription>
              {step === 'select-bank' && 'Choose your financial institution from the list below.'}
              {step === 'enter-credentials' && 'Enter your online banking username and password.'}
              {step === 'loading' && 'Securely connecting to your bank...'}
            </DialogDescription>
          </DialogHeader>

          {step === 'select-bank' && (
            <div className="grid grid-cols-2 gap-4 py-4">
              {MOCK_BANKS.map((bank) => (
                <div
                  key={bank.id}
                  className="flex flex-col items-center justify-center p-4 border rounded-md cursor-pointer hover:bg-accent"
                  onClick={() => handleSelectBank(bank.id)}
                >
                  <div className="text-2xl mb-2">{bank.logo}</div>
                  <div className="text-sm font-medium">{bank.name}</div>
                </div>
              ))}
            </div>
          )}

          {step === 'enter-credentials' && (
            <form onSubmit={handleSubmitCredentials} className="space-y-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="username" className="text-sm font-medium">Username</label>
                <input
                  id="username"
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <input
                  id="password"
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="text-xs text-muted-foreground">
                <p>This is a demo. Any username and password will work.</p>
                <p>Your credentials are not stored or transmitted anywhere.</p>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button type="submit">
                  Connect
                </Button>
              </div>
            </form>
          )}

          {step === 'loading' && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-center text-sm text-muted-foreground">
                Securely connecting to your bank. This may take a moment...
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MockPlaidLink;
