import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion';
import { ChevronLeft, ChevronRight, Plus, MoreVertical, EyeOff } from 'lucide-react';
import { budgetApi, BudgetItem, BudgetResponse } from '../lib/api';
import { format, addMonths, parse } from 'date-fns';

const sectionTypes = {
  income: ['Salary', 'Bonus', 'Other'],
  bills: ['Rent', 'Utilities', 'Insurance', 'Other'],
  subscriptions: ['Streaming', 'Software', 'Other'],
  investments: ['Stocks', 'Bonds', 'Crypto', 'Other'],
};

const pieColors = [
  '#6366f1', // Planned spending (blue)
  '#a78bfa', // Other spending (purple)
  '#34d399', // Available (green)
];

function formatCurrency(amount: number) {
  const sign = amount < 0 ? '-' : '';
  return `${sign}$${Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const getMonthString = (date: Date) => format(date, 'MMMM yyyy');

const BudgetPage: React.FC = () => {
  const [monthDate, setMonthDate] = useState(() => new Date());
  const [month, setMonth] = useState(getMonthString(new Date()));
  const [data, setData] = useState<BudgetResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState<string | null>(null);
  const [formState, setFormState] = useState<{ [key: string]: { amount: string; type: string } }>({});
  const [error, setError] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<{ section: string; item: BudgetItem } | null>(null);

  // Update month string when monthDate changes
  useEffect(() => {
    setMonth(getMonthString(monthDate));
  }, [monthDate]);

  // Fetch budget data on month change
  useEffect(() => {
    setLoading(true);
    budgetApi.getBudget(month)
      .then(res => {
        setData(res);
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load budget data');
        setLoading(false);
      });
  }, [month]);

  // Organize items by section
  const sectionKeys = Object.keys(sectionTypes);
  const sections = sectionKeys.map(key => ({
    key,
    label: key.charAt(0).toUpperCase() + key.slice(1),
    addLabel: `Add ${key.charAt(0).toUpperCase() + key.slice(1)}`.replace('Bills', 'Bill').replace('Investments', 'Investment'),
    items: data ? data.items.filter(item => item.section === key) : [],
  }));

  // Calculate section totals
  const sectionsWithTotals = sections.map(section => {
    const total = section.items.reduce((sum, item) => sum + (isNaN(item.amount) ? 0 : item.amount), 0);
    return { ...section, value: total };
  });

  // Calculate summary values from data.items
  const income = data ? data.items.filter(i => i.section === 'income').reduce((sum, i) => sum + i.amount, 0) : 0;
  const bills = data ? data.items.filter(i => i.section === 'bills').reduce((sum, i) => sum + i.amount, 0) : 0;
  const subscriptions = data ? data.items.filter(i => i.section === 'subscriptions').reduce((sum, i) => sum + i.amount, 0) : 0;
  const investments = data ? data.items.filter(i => i.section === 'investments').reduce((sum, i) => sum + i.amount, 0) : 0;
  const plannedSpending = bills + subscriptions + investments;
  // For demo, treat any negative income as 'other spending' (customize as needed)
  const otherSpending = data ? data.items.filter(i => i.section !== 'income' && i.amount < 0).reduce((sum, i) => sum + Math.abs(i.amount), 0) : 0;
  const availableBudget = income - plannedSpending - otherSpending;
  const perDayBudget = availableBudget / 30;

  // Pie chart values from real data
  const planned = plannedSpending;
  const other = otherSpending;
  const available = availableBudget > 0 ? availableBudget : 0;
  const total = planned + other + available;
  const plannedPct = total > 0 ? (planned / total) * 100 : 0;
  const otherPct = total > 0 ? (other / total) * 100 : 0;
  const availablePct = total > 0 ? (available / total) * 100 : 0;

  // Handle add form submit
  const handleAdd = async (sectionKey: string) => {
    const { amount, type } = formState[sectionKey] || { amount: '', type: '' };
    if (!amount || !type) return;
    try {
      const newItem = await budgetApi.createBudget({
        amount: parseFloat(amount),
        type,
        section: sectionKey,
        month,
      });
      setData(prev => prev ? { ...prev, items: [...prev.items, newItem] } : prev);
      setFormState(f => ({ ...f, [sectionKey]: { amount: '', type: '' } }));
      setOpenForm(null);
    } catch (err) {
      setError('Failed to add budget item');
    }
  };

  // Edit handler
  const handleEdit = (sectionKey: string, item: BudgetItem) => {
    setEditItem({ section: sectionKey, item });
    setFormState(f => ({ ...f, [sectionKey]: { amount: String(item.amount), type: item.type } }));
    setOpenForm(null);
  };

  // Submit edit
  const handleEditSubmit = async (sectionKey: string, item: BudgetItem) => {
    const { amount, type } = formState[sectionKey] || { amount: '', type: '' };
    if (!amount || !type) return;
    try {
      const updated = await budgetApi.updateBudget(item.id, {
        ...item,
        amount: parseFloat(amount),
        type,
        section: sectionKey,
      });
      setData(prev => prev ? { ...prev, items: prev.items.map(i => i.id === item.id ? updated : i) } : prev);
      setEditItem(null);
      setFormState(f => ({ ...f, [sectionKey]: { amount: '', type: '' } }));
    } catch (err) {
      setError('Failed to update budget item');
    }
  };

  // Delete handler
  const handleDelete = async (itemId: number) => {
    if (!window.confirm('Delete this budget item?')) return;
    try {
      await budgetApi.deleteBudget(itemId);
      setData(prev => prev ? { ...prev, items: prev.items.filter(i => i.id !== itemId) } : prev);
    } catch (err) {
      setError('Failed to delete budget item');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="flex flex-col gap-6 bg-[#f7f8fa] min-h-[calc(100vh-80px)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl font-semibold text-[#222]">Spending Plan</div>
        {/* Pie Chart moved here */}
        <div className="flex flex-col items-center flex-1">
          <div className="flex flex-col items-center">
            <svg width="64" height="64" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="#e5e7eb" />
              <circle
                cx="18" cy="18" r="16"
                fill="transparent"
                stroke={pieColors[0]}
                strokeWidth="4"
                strokeDasharray={`${plannedPct} ${100 - plannedPct}`}
                strokeDashoffset="0"
              />
              <circle
                cx="18" cy="18" r="16"
                fill="transparent"
                stroke={pieColors[1]}
                strokeWidth="4"
                strokeDasharray={`${otherPct} ${100 - otherPct}`}
                strokeDashoffset={-plannedPct}
              />
              <circle
                cx="18" cy="18" r="16"
                fill="transparent"
                stroke={pieColors[2]}
                strokeWidth="4"
                strokeDasharray={`${availablePct} ${100 - availablePct}`}
                strokeDashoffset={-(plannedPct + otherPct)}
              />
            </svg>
            <div className="flex gap-2 mt-2 text-[13px]">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: pieColors[0] }}></span>Planned</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: pieColors[1] }}></span>Other</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: pieColors[2] }}></span>Avail</span>
            </div>
          </div>
        </div>
        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:bg-gray-100"
            onClick={() => setMonthDate(prev => addMonths(prev, -1))}
          >
            <ChevronLeft />
          </Button>
          <span className="font-medium text-gray-700 text-base">{month}</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:bg-gray-100"
            onClick={() => setMonthDate(prev => addMonths(prev, 1))}
          >
            <ChevronRight />
          </Button>
        </div>
      </div>
      <div className="flex gap-6">
        {/* Left Summary Panel */}
        <div className="w-56 flex-shrink-0 flex flex-col gap-4 sticky top-6 self-start" style={{ alignSelf: 'flex-start' }}>
          <Card className="rounded-lg shadow-none p-2 bg-[#f7f8fa] min-h-[90px] flex flex-col justify-center">
            <div className="text-base font-extrabold text-[#222]">{formatCurrency(income)}</div>
            <div className="text-gray-500 text-xs mt-0.5">Income</div>
          </Card>
          <Card className="rounded-lg shadow-none p-2 bg-[#f7f8fa] min-h-[90px] flex flex-col justify-center">
            <div className="text-sm font-bold text-[#a78bfa]">{formatCurrency(plannedSpending)}</div>
            <div className="text-gray-500 text-xs mt-0.5">Planned spending</div>
          </Card>
          <Card className="rounded-lg shadow-none p-2 bg-[#f7f8fa] min-h-[90px] flex flex-col justify-center">
            <div className="text-sm font-bold text-[#a78bfa]">{formatCurrency(otherSpending)}</div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#a78bfa]"></span>
              <span className="text-gray-500 text-xs">Other spending</span>
            </div>
          </Card>
          <Card className="rounded-lg shadow-none p-2 bg-[#f7f8fa] min-h-[90px] flex flex-col justify-center">
            <div className="text-sm font-extrabold text-[#10b981]">{formatCurrency(availableBudget)}</div>
            <div className="text-gray-500 text-xs mt-0.5">available</div>
            <div className="text-[10px] text-gray-400">(${perDayBudget.toLocaleString(undefined, { minimumFractionDigits: 2 })} per day)</div>
          </Card>
        </div>
        {/* Main Panel */}
        <div className="flex-1 min-w-[700px] max-w-5xl mx-auto">
          <Accordion type="multiple" className="space-y-8">
            {sectionsWithTotals.map(section => (
              <AccordionItem key={section.key} value={section.key} className="bg-[#f6fafd] rounded-2xl border-none">
                <AccordionTrigger className="px-10 py-6">
                  <div className="flex items-center w-full">
                    <span className="flex-1 text-lg font-semibold text-[#222]">{section.label}</span>
                    <div className="flex items-center gap-4">
                      <Button
                        variant="outline"
                        className="text-[#6366f1] text-base font-medium flex items-center gap-1 px-4 py-2 border-[#a78bfa] border rounded-lg hover:bg-[#f3f0ff]"
                        style={{ minWidth: 200 }}
                        onClick={e => {
                          e.preventDefault();
                          setOpenForm(openForm === section.key ? null : section.key);
                          setFormState(f => ({ ...f, [section.key]: { amount: '', type: sectionTypes[section.key as keyof typeof sectionTypes][0] } }));
                        }}
                      >
                        <Plus size={18} /> {section.addLabel}
                      </Button>
                      <EyeOff className="text-[#a78bfa]" size={20} />
                      <span className={section.value < 0 ? 'text-[#222]' : 'text-[#222] font-bold'} style={{ minWidth: 110, textAlign: 'right', fontSize: '1.15rem' }}>{formatCurrency(section.value)}</span>
                      <MoreVertical className="text-gray-400 ml-2" size={20} />
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-12 pb-6">
                  {openForm === section.key && (
                    <form
                      className="flex items-end gap-4 mb-4 bg-white p-4 rounded-xl shadow-sm"
                      onSubmit={e => {
                        e.preventDefault();
                        handleAdd(section.key);
                      }}
                    >
                      <div>
                        <label className="block text-xs mb-1">Amount</label>
                        <Input
                          type="number"
                          min={0}
                          value={formState[section.key]?.amount || ''}
                          onChange={e => setFormState(f => ({ ...f, [section.key]: { ...f[section.key], amount: e.target.value } }))}
                          className="w-32"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Type</label>
                        <select
                          className="border rounded px-2 py-1 w-40"
                          value={formState[section.key]?.type || sectionTypes[section.key as keyof typeof sectionTypes][0]}
                          onChange={e => setFormState(f => ({ ...f, [section.key]: { ...f[section.key], type: e.target.value } }))}
                        >
                          {sectionTypes[section.key as keyof typeof sectionTypes].map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </div>
                      <Button type="submit" className="mb-1">Add</Button>
                      <Button type="button" variant="ghost" className="mb-1" onClick={() => setOpenForm(null)}>Cancel</Button>
                    </form>
                  )}
                  {section.items.length === 0 ? (
                    <div className="text-gray-400 text-sm">No items yet.</div>
                  ) : (
                    <ul className="space-y-2">
                      {section.items.map((item: any) => (
                        <li key={item.id} className="flex items-center gap-4">
                          {editItem && editItem.item.id === item.id ? (
                            <form
                              className="flex items-end gap-2"
                              onSubmit={e => { e.preventDefault(); handleEditSubmit(section.key, item); }}
                            >
                              <Input
                                type="number"
                                min={0}
                                value={formState[section.key]?.amount || ''}
                                onChange={e => setFormState(f => ({ ...f, [section.key]: { ...f[section.key], amount: e.target.value } }))}
                                className="w-24"
                                required
                              />
                              <select
                                className="border rounded px-2 py-1 w-28"
                                value={formState[section.key]?.type || sectionTypes[section.key as keyof typeof sectionTypes][0]}
                                onChange={e => setFormState(f => ({ ...f, [section.key]: { ...f[section.key], type: e.target.value } }))}
                              >
                                {sectionTypes[section.key as keyof typeof sectionTypes].map(type => (
                                  <option key={type} value={type}>{type}</option>
                                ))}
                              </select>
                              <Button type="submit" size="sm">Save</Button>
                              <Button type="button" size="sm" variant="ghost" onClick={() => setEditItem(null)}>Cancel</Button>
                            </form>
                          ) : (
                            <>
                              <span className="font-medium">{item.type}</span>
                              <span className="text-[#6366f1]">{formatCurrency(item.amount)}</span>
                              <Button size="sm" variant="ghost" onClick={() => handleEdit(section.key, item)}>Edit</Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>Delete</Button>
                            </>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage; 