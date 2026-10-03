'use client';

import React, { useState, useEffect } from 'react';
import { Mission, Season, MissionType, QuizQuestionItem, ScreenshotRequirement, BroadcastEvent, GiftCardLog } from '@/lib/types';
import { PLATFORM_ACHIEVEMENTS, PlatformAchievement } from '@/lib/achievementsData';
import { ALL_30_CARDS } from '@/lib/cardsData';
import { sound } from '@/lib/soundFx';
import { Radio, Megaphone, Send, Award, Trophy, Bell, Check, Users, Sparkle, Tag, Gift, Search, CheckCircle2, X } from 'lucide-react';
import Link from 'next/link';
import {
  Calendar,
  Edit3,
  Plus,
  Trash2,
  Lock,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  ExternalLink,
  HelpCircle,
  Camera,
  GripVertical,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Square,
} from 'lucide-react';

export default function AdminPage() {
  const [passkey, setPasskey] = useState('');
  const [authenticating, setAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Top Level Tab Navigation
  const [activeAdminTab, setActiveAdminTab] = useState<'scheduler' | 'broadcast' | 'gift'>('scheduler');

  // Gift Card Enclave State
  const [giftRecipient, setGiftRecipient] = useState<string>('@yournahian');
  const [giftSelectedCardId, setGiftSelectedCardId] = useState<string>('pioneer');
  const [giftQuantity, setGiftQuantity] = useState<number>(1);
  const [giftReason, setGiftReason] = useState<string>('Community MVP & Alpha Contributor');
  const [giftRarityFilter, setGiftRarityFilter] = useState<string>('ALL');
  const [giftCardSearch, setGiftCardSearch] = useState<string>('');
  const [giftLogs, setGiftLogs] = useState<GiftCardLog[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<Array<{
    username: string;
    totalCardsCount: number;
    uniqueCardsCount: number;
    lifetimePoints: number;
    inventory: Record<string, number>;
  }>>([]);
  const [isGifting, setIsGifting] = useState<boolean>(false);
  const [giftActionMsg, setGiftActionMsg] = useState<string>('');

  const fetchGiftData = async () => {
    try {
      const res = await fetch('/api/admin/gift-card');
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.giftLogs)) {
          setGiftLogs(data.giftLogs);
        }
        if (Array.isArray(data.users)) {
          setRegisteredUsers(data.users);
        }
      }
    } catch (err) {
      console.error('Failed to load gift data:', err);
    }
  };

  const handleSendGift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!giftRecipient.trim()) {
      setGiftActionMsg('⚠️ Recipient username/handle is required');
      return;
    }
    if (!giftSelectedCardId) {
      setGiftActionMsg('⚠️ Please select a card to gift');
      return;
    }

    try {
      setIsGifting(true);
      const res = await fetch('/api/admin/gift-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passkey,
          username: giftRecipient.trim(),
          cardId: giftSelectedCardId,
          quantity: giftQuantity,
          reason: giftReason.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        try {
          sound.playJackpot();
        } catch (_) {}
        setGiftActionMsg(`✓ Successfully dispatched ${giftQuantity}x "${data.giftLog?.cardTitle || giftSelectedCardId}" gift to @${data.user?.username || giftRecipient}! (Queued for 3D card reveal in player's Daily Missions tab)`);
        fetchGiftData();
        setTimeout(() => setGiftActionMsg(''), 7000);
      } else {
        setGiftActionMsg(`⚠️ Error: ${data.error || 'Failed to gift card'}`);
      }
    } catch (err) {
      setGiftActionMsg('⚠️ Network error while dispatching card gift');
    } finally {
      setIsGifting(false);
    }
  };

  const handleDeleteGiftLog = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/gift-card?id=${encodeURIComponent(id)}&key=${encodeURIComponent(passkey)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setGiftLogs((prev) => prev.filter((g) => g.id !== id));
        setGiftActionMsg('✓ Airdrop log removed from protocol ledger.');
        setTimeout(() => setGiftActionMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Broadcast Achievements State
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastEvent[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('genesis_pioneer');
  const [bcastRecipient, setBcastRecipient] = useState<string>('@yournahian');
  const [bcastTitle, setBcastTitle] = useState<string>('Genesis Pioneer');
  const [bcastDesc, setBcastDesc] = useState<string>('Registered for Season 1 and activated cryogenic telemetry.');
  const [bcastIcon, setBcastIcon] = useState<string>('🚀');
  const [bcastTier, setBcastTier] = useState<'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Mythic'>('Bronze');
  const [bcastShards, setBcastShards] = useState<number>(50);
  const [bcastMessage, setBcastMessage] = useState<string>('Outstanding season 1 protocol participation & verified milestone!');
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [bcastActionMsg, setBcastActionMsg] = useState<string>('');
  const [broadcastType, setBroadcastType] = useState<'mission' | 'achievement' | 'system_notice'>('mission');
  const [noticeSeverity, setNoticeSeverity] = useState<'maintenance' | 'critical' | 'upgrade' | 'announcement'>('maintenance');
  const [missionCategory, setMissionCategory] = useState<string>('trollbox');
  const [targetCount, setTargetCount] = useState<number>(10);

  const [missions, setMissions] = useState<Mission[]>([]);
  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Drag and drop state
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Form State for creating a single scheduled mission
  const [dayNumber, setDayNumber] = useState<number>(1);
  const [scheduledDate, setScheduledDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [link, setLink] = useState('https://x.com/RialoHQ');
  const [type, setType] = useState<MissionType>('twitter_follow');
  const [actionLabel, setActionLabel] = useState('Follow on X');
  const [rewardShards, setRewardShards] = useState<number>(25);
  const [screenshotRequirement, setScreenshotRequirement] = useState<ScreenshotRequirement>('none');
  const [rewardCardId, setRewardCardId] = useState<string>('');
  const [rewardCardCount, setRewardCardCount] = useState<number>(1);
  const [editingMissionId, setEditingMissionId] = useState<string | null>(null);

  // Dedicated Quiz Fields
  const [quizQuestion, setQuizQuestion] = useState('What makes Rialo consensus unique?');
  const [quizOptA, setQuizOptA] = useState('Sub-second finality with parallel pipeline execution');
  const [quizOptB, setQuizOptB] = useState('Proof of Work with slow 10-minute blocks');
  const [quizOptC, setQuizOptC] = useState('Centralized single server sequencer');
  const [quizOptD, setQuizOptD] = useState('Manual block verification by foundation');
  const [correctOption, setCorrectOption] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [quizExplanation, setQuizExplanation] = useState('Rialo utilizes an asynchronous, parallel execution pipeline achieving sub-second finality.');

  // Multi-Question Bulk Toggle & Raw Input (Que???options???ans)
  const [quizMode, setQuizMode] = useState<'single' | 'bulk'>('single');
  const [bulkQuizText, setBulkQuizText] = useState(
    "What is Rialo's core consensus throughput mechanism????Sub-second parallel pipeline, 10-minute PoW, Manual Sequencer, Delayed Finality???Sub-second parallel pipeline\n" +
    "What physical phenomenon inspires Rialo's execution form????Superconductivity and Superfluidity, Hot combustion, Gravitational friction, Magnetic decay???Superconductivity and Superfluidity\n" +
    "What is Rialo's native token symbol????$RIA, $ETH, $SOL, $BTC???$RIA"
  );
  const [parsedBulkQuestions, setParsedBulkQuestions] = useState<QuizQuestionItem[]>([]);

  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!passkey.trim()) {
      setAuthError('Please enter the admin password');
      return;
    }
    setAuthenticating(true);
    setAuthError('');
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: passkey.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setAuthError('');
        sessionStorage.setItem('rialo_admin_key', passkey.trim());
        fetchAdminMissions(passkey.trim(), true);
        fetchBroadcastHistory();
        fetchGiftData();
      } else {
        setAuthError(data.error || 'Invalid Admin Password. Check your ADMIN_PASSWORD in .env');
      }
    } catch (err: any) {
      setAuthError('Error communicating with authentication server.');
    } finally {
      setAuthenticating(false);
    }
  };

  useEffect(() => {
    const savedKey = typeof window !== 'undefined' ? sessionStorage.getItem('rialo_admin_key') : null;
    if (savedKey) {
      setPasskey(savedKey);
      fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passkey: savedKey }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setIsAuthenticated(true);
            fetchAdminMissions(savedKey, true);
            fetchBroadcastHistory();
        fetchGiftData();
          } else {
            sessionStorage.removeItem('rialo_admin_key');
          }
        })
        .catch(() => {});
    }
  }, []);

  const fetchBroadcastHistory = async () => {
    try {
      const res = await fetch('/api/admin/broadcast');
      const data = await res.json();
      if (data.success && Array.isArray(data.broadcasts)) {
        setBroadcastHistory(data.broadcasts);
      }
    } catch (err) {
      console.error('Failed to load broadcasts:', err);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    setSelectedPresetId(presetId);
    if (presetId === 'custom') {
      setBcastTitle('Community MVP Vanguard');
      setBcastDesc('Special administrative honor awarded for exceptional platform contributions.');
      setBcastIcon('🌟');
      setBcastTier('Mythic');
      setBcastShards(250);
    } else {
      const found = PLATFORM_ACHIEVEMENTS.find((p) => p.id === presetId);
      if (found) {
        setBcastTitle(found.title);
        setBcastDesc(found.desc);
        setBcastIcon(found.icon);
        setBcastTier(found.tier);
        setBcastShards(found.shardsReward);
      }
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bcastTitle || !bcastRecipient) {
      setBcastActionMsg('⚠️ Title and recipient handle are required');
      return;
    }

    try {
      setIsBroadcasting(true);
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passkey,
          broadcastType,
          achievementId: selectedPresetId,
          title: bcastTitle,
          desc: bcastDesc,
          icon: bcastIcon,
          tier: bcastTier,
          recipient: bcastRecipient,
          shardsReward: bcastShards,
          message: bcastMessage,
          missionCategory,
          targetCount,
          noticeSeverity,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setBcastActionMsg(`✓ Successfully broadcasted ${broadcastType === 'mission' ? 'Mission' : 'Achievement'} "${bcastTitle}" to ${bcastRecipient}! (+${bcastShards} Shards reward)`);
        fetchBroadcastHistory();
        fetchGiftData();
        setTimeout(() => setBcastActionMsg(''), 6000);
      } else {
        setBcastActionMsg(`⚠️ Error: ${data.error || 'Failed to dispatch broadcast'}`);
      }
    } catch (err) {
      setBcastActionMsg('⚠️ Network error while dispatching broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleDeleteBroadcast = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/broadcast?id=${encodeURIComponent(id)}&key=${encodeURIComponent(passkey)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setBroadcastHistory((prev) => prev.filter((b) => b.id !== id));
        setBcastActionMsg('✓ Broadcast event removed from protocol ledger.');
        setTimeout(() => setBcastActionMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    handleAuth();
    fetchBroadcastHistory();
        fetchGiftData();
  }, []);

  const fetchAdminMissions = async (key: string, isSilent = false) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/missions?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (data.success) {
        setMissions(data.missions || []);
        setSeason(data.season || null);
        if (!isSilent) {
          showToast(`✓ Missions refreshed! (${data.missions?.length || 0} registered)`);
        }
      } else {
        setAuthError(data.error || 'Authentication failed');
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (newType: MissionType) => {
    setType(newType);
    if (newType === 'twitter_follow') {
      setActionLabel('Follow on X');
      setLink('https://x.com/RialoHQ');
    } else if (newType === 'twitter_retweet') {
      setActionLabel('Retweet on X');
      setLink('https://x.com/RialoHQ');
    } else if (newType === 'twitter_like') {
      setActionLabel('Like on X');
      setLink('https://x.com/RialoHQ');
    } else if (newType === 'discord_join') {
      setActionLabel('Join Discord');
      setLink('https://discord.gg/RialoProtocol');
    } else if (newType === 'telegram_join') {
      setActionLabel('Join Telegram');
      setLink('https://t.me/rialoprotocol');
    } else if (newType === 'quiz') {
      setActionLabel('Take Web3 Quiz');
      setLink('');
    } else if (newType === 'custom_url') {
      setActionLabel('Visit Link');
      setLink('https://rialo.io');
    } else {
      setActionLabel('Complete Task');
    }
  };

  const parseBulkQuizText = (rawText: string): QuizQuestionItem[] => {
    const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsedList: QuizQuestionItem[] = [];

    for (const line of lines) {
      const parts = line.split('???');
      if (parts.length >= 3) {
        const question = parts[0].trim();
        const rawOptions = parts[1].trim();
        const rawAnswer = parts[2].trim();

        let options = rawOptions.includes('|')
          ? rawOptions.split('|').map((s) => s.trim())
          : rawOptions.includes(';')
          ? rawOptions.split(';').map((s) => s.trim())
          : rawOptions.split(',').map((s) => s.trim());

        options = options.filter(Boolean);

        let answer = rawAnswer;
        if (/^[a-dA-D]$/.test(rawAnswer)) {
          const idx = rawAnswer.toUpperCase().charCodeAt(0) - 65;
          if (options[idx]) answer = options[idx];
        } else if (/^[1-4]$/.test(rawAnswer)) {
          const idx = parseInt(rawAnswer) - 1;
          if (options[idx]) answer = options[idx];
        }

        const found = options.find((o) => o.toLowerCase() === answer.toLowerCase());
        if (found) {
          answer = found;
        } else if (options.length < 4) {
          options.push(answer);
        }

        if (question && options.length > 0) {
          parsedList.push({ question, options, answer });
        }
      }
    }
    return parsedList;
  };

  const handleGenerateFromBulk = () => {
    const list = parseBulkQuizText(bulkQuizText);
    setParsedBulkQuestions(list);
    if (list.length > 0) {
      showToast(`✓ Generated ${list.length} questions from syntax!`);
    } else {
      alert("No valid questions found. Use format: Question???Option1, Option2, Option3, Option4???CorrectAnswer");
    }
  };

    const handleStartEditMission = (m: Mission) => {
    setEditingMissionId(m.id);
    setDayNumber(m.dayNumber);
    setScheduledDate(m.scheduledDate);
    setTitle(m.title);
    setDescription(m.description);
    setLink(m.link || '');
    setType(m.type);
    setActionLabel(m.actionLabel || '');
    setRewardShards(m.rewardShards || 25);
    setRewardCardId(m.rewardCardId || '');
    setRewardCardCount(m.rewardCardCount || 1);
    setScreenshotRequirement(m.screenshotRequirement || 'none');

    if (m.type === 'quiz') {
      setQuizQuestion(m.quizQuestion || m.title);
      if (m.quizOptions && m.quizOptions.length >= 4) {
        setQuizOptA(m.quizOptions[0]);
        setQuizOptB(m.quizOptions[1]);
        setQuizOptC(m.quizOptions[2]);
        setQuizOptD(m.quizOptions[3]);
        if (m.quizAnswer === m.quizOptions[1]) setCorrectOption('B');
        else if (m.quizAnswer === m.quizOptions[2]) setCorrectOption('C');
        else if (m.quizAnswer === m.quizOptions[3]) setCorrectOption('D');
        else setCorrectOption('A');
      }
      setQuizExplanation(m.quizExplanation || '');
    }

    const panel = document.getElementById('mission-editor-panel');
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth' });
    }
    const titleInput = document.getElementById('mission-title-input');
    if (titleInput) titleInput.focus();

    showToast(`?? Editing: "${m.title}". Make changes and click Save!`);
  };

  const handleCancelEdit = () => {
    setEditingMissionId(null);
    setTitle('');
    setDescription('');
    setRewardCardId('');
    setRewardCardCount(1);
    showToast('Edit mode cancelled.');
  };

  const handleQuickAddTaskToDay = (targetDay: number, targetDate: string) => {
    setEditingMissionId(null);
    setDayNumber(targetDay);
    setScheduledDate(targetDate);
    setTitle('');
    setDescription('');
    setRewardCardId('');
    setRewardCardCount(1);
    const panel = document.getElementById('mission-editor-panel');
    if (panel) {
      panel.scrollIntoView({ behavior: 'smooth' });
    }
    const titleInput = document.getElementById('mission-title-input');
    if (titleInput) titleInput.focus();
    showToast(`? Adding another task for Day ${targetDay} (${targetDate})! Enter title and click Schedule.`);
  };

const handleCreateMission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return alert('Please specify a title for the mission');

    let answerText = quizOptA;
    if (correctOption === 'B') answerText = quizOptB;
    if (correctOption === 'C') answerText = quizOptC;
    if (correctOption === 'D') answerText = quizOptD;

    let finalQuizQuestions: QuizQuestionItem[] | undefined = undefined;
    let finalMainQuestion = quizQuestion.trim();
    let finalMainOptions = [quizOptA.trim(), quizOptB.trim(), quizOptC.trim(), quizOptD.trim()];
    let finalMainAnswer = answerText.trim();

    if (type === 'quiz' && quizMode === 'bulk') {
      const parsed = parsedBulkQuestions.length > 0 ? parsedBulkQuestions : parseBulkQuizText(bulkQuizText);
      if (parsed.length > 0) {
        finalQuizQuestions = parsed;
        finalMainQuestion = parsed[0].question;
        finalMainOptions = parsed[0].options;
        finalMainAnswer = parsed[0].answer;
      }
    }

    const missionToSave: Mission = {
      id: editingMissionId || `m-${Date.now()}`,
      dayNumber: Number(dayNumber),
      scheduledDate,
      title: title.trim(),
      description: description.trim(),
      link: link.trim(),
      type,
      actionLabel: actionLabel.trim() || undefined,
      rewardPacks: 1,
      rewardShards: Number(rewardShards) || 25,
      rewardCardId: rewardCardId ? rewardCardId : undefined,
      rewardCardCount: rewardCardId ? (Number(rewardCardCount) || 1) : undefined,
      screenshotRequirement,
      isActive: editingMissionId ? (missions.find((m) => m.id === editingMissionId)?.isActive ?? true) : true,
      quizQuestion: type === 'quiz' ? finalMainQuestion : undefined,
      quizOptions: type === 'quiz' ? finalMainOptions : undefined,
      quizAnswer: type === 'quiz' ? finalMainAnswer : undefined,
      quizExplanation: type === 'quiz' ? quizExplanation.trim() : undefined,
      quizQuestions: type === 'quiz' ? finalQuizQuestions : undefined,
    };

    if (editingMissionId) {
      setMissions((prev) => prev.map((m) => (m.id === editingMissionId ? missionToSave : m)));
      showToast(`? Mission "${missionToSave.title}" updated successfully!`);
    } else {
      setMissions((prev) => [...prev, missionToSave]);
      showToast(`? Mission scheduled for Day ${dayNumber}!`);
    }

    setEditingMissionId(null);
    setTitle('');
    setDescription('');
    setRewardCardId('');
    setRewardCardCount(1);

    try {
      const res = await fetch(`/api/admin/missions?key=${encodeURIComponent(passkey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_MISSION',
          mission: missionToSave,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`✓ Mission scheduled and synced on server for Day ${dayNumber}!`);
      } else {
        showToast(`⚠️ Server error: ${data.error || 'Failed to save mission'}`);
      }
      fetchAdminMissions(passkey, true);
    } catch (err) {
      console.error(err);
      showToast('⚠️ Network error saving mission');
    }
  };

  // Immediate Single Delete (Optimistic + Infallible)
  const handleDeleteMission = async (id: string) => {
    // Immediate optimistic update
    setMissions((prev) => prev.filter((m) => m.id !== id));
    setSelectedIds((prev) => prev.filter((x) => x !== id));
    showToast('✓ Mission deleted.');

    try {
      await fetch(`/api/admin/missions?key=${encodeURIComponent(passkey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE_MISSION',
          missionId: id,
        }),
      });
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  // Bulk Select Toggle
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Select All Toggle
  const handleSelectAll = () => {
    if (selectedIds.length === missions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(missions.map((m) => m.id));
    }
  };

  // Bulk Delete Selected
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    const toDelete = [...selectedIds];

    // Optimistic UI update
    setMissions((prev) => prev.filter((m) => !toDelete.includes(m.id)));
    setSelectedIds([]);
    showToast(`✓ Deleted ${toDelete.length} selected missions.`);

    try {
      await fetch(`/api/admin/missions?key=${encodeURIComponent(passkey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BULK_DELETE',
          missionIds: toDelete,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Drag and Drop & Up/Down Reorder
  const handleDropReorder = async (fromIdx?: number, toIdx?: number) => {
    const from = fromIdx !== undefined ? fromIdx : draggedIndex;
    const to = toIdx !== undefined ? toIdx : dragOverIndex;

    if (from === null || to === null || from === to || from < 0 || to < 0 || from >= missions.length || to >= missions.length) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...missions];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);

    // Re-index Day Numbers chronologically 1..N
    const reindexed = updated.map((m, idx) => ({
      ...m,
      dayNumber: idx + 1,
    }));

    setMissions(reindexed);
    setDraggedIndex(null);
    setDragOverIndex(null);
    showToast(`✓ Moved "${moved.title.slice(0, 24)}..." to #${to + 1}`);

    try {
      await fetch(`/api/admin/missions?key=${encodeURIComponent(passkey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'REORDER_MISSIONS',
          missions: reindexed,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleActive = async (m: Mission) => {
    const nextState = !m.isActive;
    setMissions((prev) =>
      prev.map((item) => (item.id === m.id ? { ...item, isActive: nextState } : item))
    );

    try {
      await fetch(`/api/admin/missions?key=${encodeURIComponent(passkey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_ACTIVE',
          missionId: m.id,
          isActive: nextState,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Instant Auto Pre-Schedule 30 Days (Non-blocking & Infallible)
  const handleBulkPrepopulate30Days = async () => {
    setIsGenerating(true);
    const today = new Date();
    const generated: Mission[] = [];
    const templates: Array<{
      t: string;
      type: MissionType;
      link: string;
      d: string;
      actionLabel: string;
      quizQ?: string;
      quizOpts?: string[];
      quizAns?: string;
    }> = [
      {
        t: 'Follow @RialoHQ official announcements',
        type: 'twitter_follow',
        link: 'https://x.com/RialoHQ',
        d: 'Stay connected with the core engineering updates on X.',
        actionLabel: 'Follow on X',
      },
      {
        t: 'Retweet Rialo Parallel Consensus Thread',
        type: 'twitter_retweet',
        link: 'https://x.com/RialoHQ',
        d: 'Amplify the testnet consensus announcement across the community.',
        actionLabel: 'Retweet Post',
      },
      {
        t: 'Daily Web3 Quiz: Superconductivity & Finality',
        type: 'quiz',
        link: '',
        d: "Answer today's technical quiz on Rialo's cold-physics architecture.",
        actionLabel: 'Take Web3 Quiz',
        quizQ: "What core physical phenomenon inspires Rialo's frictionless execution?",
        quizOpts: ['Superconductivity & Superfluidity', 'Proof of Authority Centralization', 'Manual Sharding', 'Delayed Finality'],
        quizAns: 'Superconductivity & Superfluidity',
      },
      {
        t: 'Join Rialo Discord Validator Enclave',
        type: 'discord_join',
        link: 'https://discord.gg/RialoProtocol',
        d: 'Verify your role in the official Rialo discord guild.',
        actionLabel: 'Join Discord',
      },
      {
        t: 'Explore Rialo Interactive Developer Docs',
        type: 'custom_url',
        link: 'https://docs.rialo.io',
        d: 'Review smart contract deployment guides on the official docs portal.',
        actionLabel: 'Read Docs',
      },
      {
        t: 'Like the Genesis 30-Card Archetype Reveal',
        type: 'twitter_like',
        link: 'https://x.com/RialoHQ',
        d: 'Support the digital collector card series unveiling on X.',
        actionLabel: 'Like Tweet',
      },
    ];

    for (let day = 1; day <= 30; day++) {
      const d = new Date(today);
      d.setDate(today.getDate() + (day - 1));
      const dateStr = d.toISOString().split('T')[0];
      const tmpl = templates[(day - 1) % templates.length];

      generated.push({
        id: `m-day-${day}`,
        dayNumber: day,
        scheduledDate: dateStr,
        title: `Day ${day}: ${tmpl.t}`,
        description: tmpl.d,
        link: tmpl.link,
        type: tmpl.type,
        actionLabel: tmpl.actionLabel,
        screenshotRequirement: 'none',
        quizQuestion: tmpl.quizQ,
        quizOptions: tmpl.quizOpts,
        quizAnswer: tmpl.quizAns,
        rewardPacks: 1,
        rewardShards: 25,
        isActive: true,
      });
    }

    setMissions(generated);
    setSelectedIds([]);
    showToast('✓ Successfully pre-scheduled all 30 days of missions!');

    try {
      await fetch(`/api/admin/missions?key=${encodeURIComponent(passkey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'BULK_SCHEDULE',
          missions: generated,
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const showToast = (msg: string) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(''), 4500);
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-layout" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="admin-card" style={{ maxWidth: '420px', width: '100%', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', padding: '12px', background: 'rgba(169, 221, 211, 0.15)', borderRadius: '50%', color: '#A9DDD3', marginBottom: '16px' }}>
            <Lock size={28} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 6px' }}>
            Rialo Admin Enclave
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--rialo-text-muted)', margin: '0 0 24px' }}>
            Protected admin access for scheduling daily missions & managing seasons.
          </p>

          <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <input
              type="password"
              value={passkey}
              onChange={(e) => setPasskey(e.target.value)}
              placeholder="Admin Master Password..."
              className="admin-input"
            />
            {authError && <p style={{ color: '#EF4444', fontSize: '12px', margin: 0 }}>{authError}</p>}
            <button type="submit" disabled={authenticating} className="admin-btn-primary" style={{ width: '100%' }}>
              {authenticating ? 'Verifying...' : 'Unlock Enclave'}
            </button>
          </form>

          <div style={{ marginTop: '20px' }}>
            <Link href="/" style={{ color: 'var(--rialo-text-muted)', fontSize: '12px', textDecoration: 'none' }}>
              ← Return to RialoTrace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <div className="admin-box">
        {/* Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', paddingBottom: '20px', borderBottom: '1px solid rgba(169, 221, 211, 0.12)' }}>
          <div>
            <Link
              href="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#A9DDD3', fontSize: '12px', textDecoration: 'none', marginBottom: '8px', fontWeight: 700 }}
            >
              <ArrowLeft size={14} /> Return to RialoTrace Platform
            </Link>
            <h1 style={{ fontSize: '28px', fontWeight: 900, color: '#E8E3D5', margin: 0, letterSpacing: '-0.02em' }}>
              Mission Manager & <span className="gradient-text-rialo">30-Day Scheduler</span>
            </h1>
            <p style={{ fontSize: '13px', color: 'rgba(232, 227, 213, 0.7)', marginTop: '4px' }}>
              Drag to reorder daily drops, bulk-select to delete in one click, and pre-schedule upcoming drops up to 30 days ahead.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* LOCK / SIGN OUT BUTTON */}
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('rialo_admin_key');
                setIsAuthenticated(false);
                setPasskey('');
              }}
              style={{
                height: '44px',
                padding: '0 16px',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '12px',
                color: '#FCA5A5',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 700,
                transition: 'all 0.2s',
              }}
              title="Lock Admin Enclave"
            >
              <Lock size={15} />
              <span>Lock Enclave</span>
            </button>

            {/* RELOAD BUTTON - WORKING WITH VISUAL TOAST */}
            <button
              type="button"
              onClick={() => fetchAdminMissions(passkey, false)}
              style={{
                height: '44px',
                padding: '0 16px',
                background: 'rgba(6, 10, 10, 0.85)',
                border: '1px solid rgba(169, 221, 211, 0.35)',
                borderRadius: '12px',
                color: '#E8E3D5',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 700,
                transition: 'all 0.2s',
              }}
              title="Refresh Missions List"
            >
              <RefreshCw size={16} color="#A9DDD3" className={loading ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>

            {/* AUTO PRE-SCHEDULE 30 DAYS - WORKING WITHOUT BLOCKING PROMPT */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleBulkPrepopulate30Days}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '44px',
                padding: '0 22px',
                background: isGenerating ? 'rgba(169, 221, 211, 0.5)' : 'linear-gradient(135deg, #A9DDD3 0%, #6EBBAE 100%)',
                border: '1px solid rgba(169, 221, 211, 0.5)',
                borderRadius: '12px',
                color: '#010101',
                fontSize: '13px',
                fontWeight: 900,
                cursor: isGenerating ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 18px rgba(169, 221, 211, 0.45)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
              onMouseEnter={(e) => {
                if (!isGenerating) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 24px rgba(169, 221, 211, 0.65)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 18px rgba(169, 221, 211, 0.45)';
              }}
            >
              <Sparkles size={16} color="#010101" className={isGenerating ? 'animate-spin' : ''} />
              <span>{isGenerating ? 'Generating 30 Days...' : 'Auto Pre-Schedule 30 Days'}</span>
            </button>
          </div>
        </div>

        {actionMsg && (
          <div style={{ padding: '12px 20px', background: 'rgba(169, 221, 211, 0.15)', border: '1px solid rgba(169, 221, 211, 0.4)', borderRadius: '14px', color: '#A9DDD3', fontSize: '13px', fontWeight: 800 }}>
            {actionMsg}
          </div>
        )}

        {/* ========================================================
            ADMIN TOP-LEVEL TAB SWITCHER
            ======================================================== */}
        <div style={{
          display: 'flex',
          gap: '12px',
          padding: '6px',
          background: 'rgba(6, 10, 10, 0.85)',
          border: '1px solid rgba(169, 221, 211, 0.2)',
          borderRadius: '16px',
          flexWrap: 'wrap',
        }}>
          <button
            type="button"
            onClick={() => setActiveAdminTab('scheduler')}
            style={{
              flex: '1 1 240px',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s',
              background: activeAdminTab === 'scheduler' ? '#A9DDD3' : 'transparent',
              color: activeAdminTab === 'scheduler' ? '#010101' : '#E8E3D5',
              border: 'none',
              boxShadow: activeAdminTab === 'scheduler' ? '0 0 20px rgba(169, 221, 211, 0.35)' : 'none',
            }}
          >
            <Calendar size={17} />
            <span>📋 30-Day Mission Scheduler & Manager</span>
            <span style={{
              background: activeAdminTab === 'scheduler' ? '#010101' : 'rgba(169, 221, 211, 0.15)',
              color: activeAdminTab === 'scheduler' ? '#A9DDD3' : '#A9DDD3',
              fontSize: '11px',
              fontWeight: 900,
              padding: '2px 8px',
              borderRadius: '9999px',
            }}>
              {missions.length} Days
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveAdminTab('broadcast');
              fetchBroadcastHistory();
        fetchGiftData();
            }}
            style={{
              flex: '1 1 240px',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s',
              background: activeAdminTab === 'broadcast' ? 'linear-gradient(135deg, #A9DDD3 0%, #6EBBAE 100%)' : 'transparent',
              color: activeAdminTab === 'broadcast' ? '#010101' : '#E8E3D5',
              border: 'none',
              boxShadow: activeAdminTab === 'broadcast' ? '0 0 25px rgba(169, 221, 211, 0.4)' : 'none',
            }}
          >
            <Trophy size={17} />
            <span>🏆 Broadcast Achievements & Community Feats</span>
            {broadcastHistory.length > 0 && (
              <span style={{
                background: activeAdminTab === 'broadcast' ? '#010101' : '#A9DDD3',
                color: activeAdminTab === 'broadcast' ? '#A9DDD3' : '#010101',
                fontSize: '11px',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '9999px',
              }}>
                {broadcastHistory.length} Live
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveAdminTab('gift');
              fetchGiftData();
            }}
            style={{
              flex: '1 1 240px',
              padding: '12px 20px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: 900,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.2s',
              background: activeAdminTab === 'gift' ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' : 'transparent',
              color: activeAdminTab === 'gift' ? '#FFFFFF' : '#E8E3D5',
              border: 'none',
              boxShadow: activeAdminTab === 'gift' ? '0 0 25px rgba(16, 185, 129, 0.45)' : 'none',
            }}
          >
            <Gift size={17} />
            <span>🎁 Gift Cards to Players</span>
            {giftLogs.length > 0 && (
              <span style={{
                background: activeAdminTab === 'gift' ? 'rgba(0, 0, 0, 0.35)' : 'rgba(16, 185, 129, 0.2)',
                color: activeAdminTab === 'gift' ? '#FFFFFF' : '#34D399',
                fontSize: '11px',
                fontWeight: 900,
                padding: '2px 8px',
                borderRadius: '9999px',
              }}>
                {giftLogs.length} Airdrops
              </span>
            )}
          </button>
        </div>

{activeAdminTab === 'scheduler' && (
          <>
        {/* Schedule a Specific Daily Mission Form Card */}
        <div className="admin-card" style={{ background: 'rgba(6, 10, 10, 0.95)', border: '1px solid rgba(169, 221, 211, 0.22)', borderRadius: '20px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ padding: '8px', background: 'rgba(169, 221, 211, 0.12)', borderRadius: '10px', color: '#A9DDD3' }}>
              <Calendar size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#E8E3D5', margin: 0 }}>
                Schedule a Specific Daily Mission
              </h3>
              <p style={{ fontSize: '12px', color: 'rgba(232, 227, 213, 0.65)', margin: '2px 0 0' }}>
                Fill in details for any custom drop. For Web3 Quizzes, question and options configure automatically below.
              </p>
            </div>
          </div>

          <form onSubmit={handleCreateMission}>
            <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px' }}>
              <div className="admin-input-group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#E8E3D5', marginBottom: '6px', display: 'block' }}>Day Number (1-30)</label>
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={dayNumber}
                  onChange={(e) => setDayNumber(Number(e.target.value))}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', background: 'rgba(12, 16, 16, 0.9)', border: '1px solid rgba(169, 221, 211, 0.25)', borderRadius: '10px', padding: '0 14px', color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="admin-input-group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#E8E3D5', marginBottom: '6px', display: 'block' }}>Scheduled Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', background: 'rgba(12, 16, 16, 0.9)', border: '1px solid rgba(169, 221, 211, 0.25)', borderRadius: '10px', padding: '0 14px', color: '#FFFFFF', fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="admin-input-group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#E8E3D5', marginBottom: '6px', display: 'block' }}>Mission Type</label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as MissionType)}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', background: 'rgba(12, 16, 16, 0.9)', border: '1px solid rgba(169, 221, 211, 0.35)', borderRadius: '10px', padding: '0 14px', color: '#A9DDD3', fontWeight: 700 }}
                >
                  <option value="twitter_follow">X (Twitter) Follow</option>
                  <option value="twitter_retweet">X (Twitter) Retweet / Quote</option>
                  <option value="twitter_like">X (Twitter) Like Post</option>
                  <option value="discord_join">Discord Guild Join</option>
                  <option value="telegram_join">Telegram Community Join</option>
                  <option value="quiz">💡 Daily Web3 Quiz (Interactive Q&A)</option>
                  <option value="custom_url">Visit Custom Docs / Testnet dApp</option>
                  <option value="custom_task">Custom Community Creative Mission</option>
                </select>
              </div>

              <div className="admin-input-group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#E8E3D5', marginBottom: '6px', display: 'block' }}>Reward Shards</label>
                <input
                  type="number"
                  value={rewardShards}
                  onChange={(e) => setRewardShards(Number(e.target.value))}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', background: 'rgba(12, 16, 16, 0.9)', border: '1px solid rgba(169, 221, 211, 0.25)', borderRadius: '10px', padding: '0 14px', color: '#A9DDD3', fontWeight: 800, fontFamily: 'var(--font-mono)' }}
                />
              </div>

              <div className="admin-input-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#E8E3D5', marginBottom: '6px', display: 'block' }}>Mission Title</label>
                <input
                  type="text"
                  placeholder="e.g. Follow @RialoHQ on X or Solve Today's Finality Quiz"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', background: 'rgba(12, 16, 16, 0.9)', border: '1px solid rgba(169, 221, 211, 0.25)', borderRadius: '10px', padding: '0 14px', color: '#FFFFFF' }}
                />
              </div>

              <div className="admin-input-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#E8E3D5', marginBottom: '6px', display: 'block' }}>
                  {type === 'quiz' ? 'Action / Reference Link (Optional)' : 'Action Link URL (Tweet, Discord, Telegram, or Webpage)'}
                </label>
                <input
                  type="text"
                  placeholder={type === 'quiz' ? 'Optional reference link (e.g. docs.rialo.io)' : 'https://x.com/RialoHQ'}
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', background: 'rgba(12, 16, 16, 0.9)', border: '1px solid rgba(169, 221, 211, 0.25)', borderRadius: '10px', padding: '0 14px', color: '#FFFFFF' }}
                />
              </div>

              <div className="admin-input-group">
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#E8E3D5', marginBottom: '6px', display: 'block' }}>Custom Button Label</label>
                <input
                  type="text"
                  placeholder="e.g. Follow on X, Join Guild, Take Quiz"
                  value={actionLabel}
                  onChange={(e) => setActionLabel(e.target.value)}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', background: 'rgba(12, 16, 16, 0.9)', border: '1px solid rgba(169, 221, 211, 0.25)', borderRadius: '10px', padding: '0 14px', color: '#FFFFFF' }}
                />
              </div>

              {/* OPTIONAL CARD REWARD SELECTOR */}
              <div className="admin-input-group" style={{ gridColumn: 'span 2', padding: '14px', background: 'rgba(12, 16, 16, 0.8)', border: '1px solid rgba(169, 221, 211, 0.25)', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 800, color: '#FBBF24', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>?? Optional Collector Card Reward</span>
                  </label>
                  <span style={{ fontSize: '11px', color: 'rgba(232, 227, 213, 0.6)' }}>
                    Users receive this card in their vault upon task completion
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                  <select
                    value={rewardCardId}
                    onChange={(e) => setRewardCardId(e.target.value)}
                    className="admin-input"
                    style={{
                      width: '100%',
                      height: '42px',
                      background: 'rgba(12, 16, 16, 0.9)',
                      border: rewardCardId ? '1.5px solid #F59E0B' : '1px solid rgba(169, 221, 211, 0.25)',
                      borderRadius: '10px',
                      padding: '0 14px',
                      color: rewardCardId ? '#FBBF24' : '#E8E3D5',
                      fontWeight: 700,
                    }}
                  >
                    <option value="">? No Card (Shards only)</option>
                    <optgroup label="30 Genesis Warriors Archetypes">
                      {ALL_30_CARDS.map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.badgeEmoji} {card.title} ({card.rarity})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                  {rewardCardId && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#E8E3D5', fontWeight: 700 }}>Qty:</span>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={rewardCardCount}
                        onChange={(e) => setRewardCardCount(Math.max(1, Number(e.target.value) || 1))}
                        className="admin-input"
                        style={{ width: '70px', height: '42px', background: 'rgba(12, 16, 16, 0.9)', border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '10px', padding: '0 10px', color: '#FBBF24', fontWeight: 800, textAlign: 'center' }}
                      />
                    </div>
                  )}
                </div>
                {rewardCardId && (() => {
                  const sel = ALL_30_CARDS.find((c) => c.id === rewardCardId);
                  if (!sel) return null;
                  return (
                    <div style={{ marginTop: '8px', fontSize: '11px', color: '#FBBF24', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>? Rewarding {rewardCardCount}x <strong>{sel.title}</strong> ({sel.rarity}) for completing this quest!</span>
                    </div>
                  );
                })()}
              </div>

              {/* SCREENSHOT PROOF VERIFICATION CONFIGURATION */}
              <div className="admin-input-group" style={{ gridColumn: '1 / -1', padding: '16px', background: 'rgba(12, 16, 16, 0.8)', border: '1px solid rgba(169, 221, 211, 0.25)', borderRadius: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Camera size={16} color="#A9DDD3" />
                    <label style={{ fontSize: '13px', fontWeight: 800, color: '#E8E3D5', margin: 0 }}>
                      Screenshot (SS) Proof Verification
                    </label>
                  </div>
                  <span style={{ fontSize: '11px', color: 'rgba(232, 227, 213, 0.6)' }}>
                    Require or allow users to upload screenshot proof to verify completion
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setScreenshotRequirement('none')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: screenshotRequirement === 'none' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: screenshotRequirement === 'none' ? 'rgba(169, 221, 211, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: screenshotRequirement === 'none' ? '#A9DDD3' : 'rgba(232, 227, 213, 0.7)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>⚪ Off / No SS Required</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreenshotRequirement('optional')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: screenshotRequirement === 'optional' ? '1.5px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: screenshotRequirement === 'optional' ? 'rgba(169, 221, 211, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: screenshotRequirement === 'optional' ? '#A9DDD3' : 'rgba(232, 227, 213, 0.7)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🟡 Optional SS Proof</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setScreenshotRequirement('mandatory')}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: screenshotRequirement === 'mandatory' ? '1.5px solid #EF4444' : '1px solid rgba(255, 255, 255, 0.1)',
                      background: screenshotRequirement === 'mandatory' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      color: screenshotRequirement === 'mandatory' ? '#EF4444' : 'rgba(232, 227, 213, 0.7)',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span>🔒 Mandatory SS Required</span>
                  </button>
                </div>
              </div>

              <div className="admin-input-group" style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#E8E3D5', marginBottom: '6px', display: 'block' }}>Description & Instructions</label>
                <input
                  type="text"
                  placeholder="e.g. Complete this daily drop to earn shards and secure Season 1 pack unlocks."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="admin-input"
                  style={{ width: '100%', height: '42px', background: 'rgba(12, 16, 16, 0.9)', border: '1px solid rgba(169, 221, 211, 0.25)', borderRadius: '10px', padding: '0 14px', color: '#FFFFFF' }}
                />
              </div>
            </div>

            {/* DEDICATED QUIZ BUILDER PANEL (Shows when type === 'quiz') */}
            {type === 'quiz' && (
              <div
                style={{
                  marginTop: '24px',
                  padding: '22px',
                  background: 'rgba(169, 221, 211, 0.04)',
                  border: '1.5px dashed rgba(169, 221, 211, 0.4)',
                  borderRadius: '18px',
                }}
              >
                {/* Header with Mode Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HelpCircle size={18} color="#A9DDD3" />
                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#A9DDD3', margin: 0 }}>
                      Web3 Quiz Configuration {parsedBulkQuestions.length > 0 && quizMode === 'bulk' && `(${parsedBulkQuestions.length} Questions Ready)`}
                    </h4>
                  </div>

                  {/* Mode Toggle Button */}
                  <div style={{ display: 'flex', background: 'rgba(12, 16, 16, 0.95)', padding: '3px', borderRadius: '10px', border: '1px solid rgba(169, 221, 211, 0.25)' }}>
                    <button
                      type="button"
                      onClick={() => setQuizMode('single')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: quizMode === 'single' ? '#A9DDD3' : 'transparent',
                        color: quizMode === 'single' ? '#010101' : 'rgba(232, 227, 213, 0.7)',
                        transition: 'all 0.2s',
                      }}
                    >
                      Single Question Form
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQuizMode('bulk');
                        if (parsedBulkQuestions.length === 0) {
                          setParsedBulkQuestions(parseBulkQuizText(bulkQuizText));
                        }
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: quizMode === 'bulk' ? '#A9DDD3' : 'transparent',
                        color: quizMode === 'bulk' ? '#010101' : 'rgba(232, 227, 213, 0.7)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span>⚡ Multi-Question Syntax</span>
                      <span style={{ fontSize: '9px', padding: '1px 5px', borderRadius: '4px', background: quizMode === 'bulk' ? '#010101' : 'rgba(169, 221, 211, 0.2)', color: quizMode === 'bulk' ? '#A9DDD3' : '#E8E3D5' }}>
                        Que???options???ans
                      </span>
                    </button>
                  </div>
                </div>

                {/* BULK MULTI-QUESTION MODE */}
                {quizMode === 'bulk' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#E8E3D5' }}>
                        Write multiple questions using format: <code style={{ color: '#A9DDD3', background: 'rgba(169, 221, 211, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>Question???Option1, Option2, Option3, Option4???CorrectAnswer</code> (one per line)
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const sample = "What is Rialo's core consensus throughput mechanism????Sub-second parallel pipeline, 10-minute PoW, Manual Sequencer, Delayed Finality???Sub-second parallel pipeline\n" +
                            "What physical phenomenon inspires Rialo's execution form????Superconductivity and Superfluidity, Hot combustion, Gravitational friction, Magnetic decay???Superconductivity and Superfluidity\n" +
                            "What is Rialo's native token symbol????$RIA, $ETH, $SOL, $BTC???$RIA";
                          setBulkQuizText(sample);
                          setParsedBulkQuestions(parseBulkQuizText(sample));
                        }}
                        style={{ background: 'transparent', border: '1px solid rgba(169, 221, 211, 0.3)', color: '#A9DDD3', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Reset to Sample Syntax
                      </button>
                    </div>

                    <textarea
                      rows={6}
                      value={bulkQuizText}
                      onChange={(e) => {
                        setBulkQuizText(e.target.value);
                        setParsedBulkQuestions(parseBulkQuizText(e.target.value));
                      }}
                      placeholder="Question???Option1, Option2, Option3, Option4???Answer&#10;Question 2???OptA, OptB, OptC, OptD???OptA"
                      style={{
                        width: '100%',
                        background: 'rgba(12, 16, 16, 0.95)',
                        border: '1.5px solid rgba(169, 221, 211, 0.35)',
                        borderRadius: '12px',
                        padding: '12px 16px',
                        color: '#FFFFFF',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '12px',
                        lineHeight: '1.6',
                        resize: 'vertical',
                      }}
                    />

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={handleGenerateFromBulk}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 18px',
                          background: 'rgba(169, 221, 211, 0.15)',
                          border: '1px solid #A9DDD3',
                          borderRadius: '8px',
                          color: '#A9DDD3',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        <Sparkles size={14} />
                        <span>Generate & Refresh Set ({parsedBulkQuestions.length} Questions Detected)</span>
                      </button>
                    </div>

                    {/* Preview Generated Questions */}
                    {parsedBulkQuestions.length > 0 && (
                      <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: '#A9DDD3', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Generated Question Cards ({parsedBulkQuestions.length} Questions):
                        </span>
                        {parsedBulkQuestions.map((q, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '14px 18px',
                              background: 'rgba(12, 16, 16, 0.85)',
                              border: '1px solid rgba(169, 221, 211, 0.25)',
                              borderRadius: '12px',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ background: '#A9DDD3', color: '#010101', fontSize: '10px', fontWeight: 900, padding: '2px 6px', borderRadius: '4px', fontFamily: 'var(--font-mono)' }}>
                                Q{idx + 1}
                              </span>
                              <span style={{ fontSize: '13px', fontWeight: 700, color: '#E8E3D5' }}>{q.question}</span>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px', marginTop: '4px' }}>
                              {q.options.map((opt, oIdx) => {
                                const isAns = opt.toLowerCase() === q.answer.toLowerCase();
                                return (
                                  <div
                                    key={oIdx}
                                    style={{
                                      fontSize: '11px',
                                      padding: '4px 10px',
                                      borderRadius: '6px',
                                      background: isAns ? 'rgba(169, 221, 211, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                                      border: isAns ? '1px solid #A9DDD3' : '1px solid rgba(255, 255, 255, 0.08)',
                                      color: isAns ? '#A9DDD3' : 'rgba(232, 227, 213, 0.75)',
                                      fontWeight: isAns ? 800 : 500,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                    }}
                                  >
                                    <span>{String.fromCharCode(65 + oIdx)}.</span>
                                    <span>{opt}</span>
                                    {isAns && <span>✓</span>}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#E8E3D5', marginBottom: '6px', display: 'block' }}>
                        Quiz Question
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. What is Rialo's core consensus throughput mechanism?"
                        value={quizQuestion}
                        onChange={(e) => setQuizQuestion(e.target.value)}
                        style={{ width: '100%', height: '42px', background: 'rgba(12, 16, 16, 0.95)', border: '1px solid rgba(169, 221, 211, 0.3)', borderRadius: '10px', padding: '0 14px', color: '#FFFFFF', fontSize: '13px' }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: correctOption === 'A' ? '#A9DDD3' : '#E8E3D5', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Option A {correctOption === 'A' && '✓ (Correct)'}</span>
                        </label>
                        <input
                          type="text"
                          value={quizOptA}
                          onChange={(e) => setQuizOptA(e.target.value)}
                          placeholder="Option A text..."
                          style={{ width: '100%', height: '38px', background: 'rgba(12, 16, 16, 0.95)', border: correctOption === 'A' ? '1.5px solid #A9DDD3' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0 12px', color: '#FFFFFF', fontSize: '12px' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: correctOption === 'B' ? '#A9DDD3' : '#E8E3D5', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Option B {correctOption === 'B' && '✓ (Correct)'}</span>
                        </label>
                        <input
                          type="text"
                          value={quizOptB}
                          onChange={(e) => setQuizOptB(e.target.value)}
                          placeholder="Option B text..."
                          style={{ width: '100%', height: '38px', background: 'rgba(12, 16, 16, 0.95)', border: correctOption === 'B' ? '1.5px solid #A9DDD3' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0 12px', color: '#FFFFFF', fontSize: '12px' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: correctOption === 'C' ? '#A9DDD3' : '#E8E3D5', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Option C {correctOption === 'C' && '✓ (Correct)'}</span>
                        </label>
                        <input
                          type="text"
                          value={quizOptC}
                          onChange={(e) => setQuizOptC(e.target.value)}
                          placeholder="Option C text..."
                          style={{ width: '100%', height: '38px', background: 'rgba(12, 16, 16, 0.95)', border: correctOption === 'C' ? '1.5px solid #A9DDD3' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0 12px', color: '#FFFFFF', fontSize: '12px' }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, color: correctOption === 'D' ? '#A9DDD3' : '#E8E3D5', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Option D {correctOption === 'D' && '✓ (Correct)'}</span>
                        </label>
                        <input
                          type="text"
                          value={quizOptD}
                          onChange={(e) => setQuizOptD(e.target.value)}
                          placeholder="Option D text..."
                          style={{ width: '100%', height: '38px', background: 'rgba(12, 16, 16, 0.95)', border: correctOption === 'D' ? '1.5px solid #A9DDD3' : '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '0 12px', color: '#FFFFFF', fontSize: '12px' }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '4px' }}>
                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#A9DDD3', marginBottom: '6px', display: 'block' }}>
                          Which Option is the Correct Answer?
                        </label>
                        <select
                          value={correctOption}
                          onChange={(e) => setCorrectOption(e.target.value as any)}
                          style={{ width: '100%', height: '40px', background: 'rgba(12, 16, 16, 0.95)', border: '1.5px solid #A9DDD3', borderRadius: '10px', padding: '0 14px', color: '#A9DDD3', fontWeight: 800 }}
                        >
                          <option value="A">Option A is Correct ({quizOptA.slice(0, 35)}...)</option>
                          <option value="B">Option B is Correct ({quizOptB.slice(0, 35)}...)</option>
                          <option value="C">Option C is Correct ({quizOptC.slice(0, 35)}...)</option>
                          <option value="D">Option D is Correct ({quizOptD.slice(0, 35)}...)</option>
                        </select>
                      </div>

                      <div>
                        <label style={{ fontSize: '12px', fontWeight: 700, color: '#E8E3D5', marginBottom: '6px', display: 'block' }}>
                          Explanation / Educational Note (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="Brief note shown after answering..."
                          value={quizExplanation}
                          onChange={(e) => setQuizExplanation(e.target.value)}
                          style={{ width: '100%', height: '40px', background: 'rgba(12, 16, 16, 0.95)', border: '1px solid rgba(169, 221, 211, 0.25)', borderRadius: '10px', padding: '0 14px', color: '#FFFFFF', fontSize: '12px' }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="submit"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 28px',
                  fontSize: '14px',
                  fontWeight: 900,
                  color: '#010101',
                  background: 'linear-gradient(135deg, #A9DDD3 0%, #6EBBAE 100%)',
                  border: '1px solid rgba(169, 221, 211, 0.5)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 18px rgba(169, 221, 211, 0.4)',
                  transition: 'all 0.2s',
                }}
              >
                <Plus size={18} color="#010101" />
                <span>Schedule Mission</span>
              </button>
            </div>
          </form>
        </div>

        {/* Existing Missions Table with Bulk Actions & Drag Reorder */}
        <div className="admin-card" style={{ background: 'rgba(6, 10, 10, 0.95)', border: '1px solid rgba(169, 221, 211, 0.22)', borderRadius: '20px', padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#E8E3D5', margin: 0 }}>
              Scheduled Missions Database ({missions.length} Registered)
            </h3>

            {/* Quick Actions (Select All / Clear) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={handleSelectAll}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  background: 'rgba(169, 221, 211, 0.08)',
                  border: '1px solid rgba(169, 221, 211, 0.3)',
                  borderRadius: '8px',
                  color: '#A9DDD3',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {selectedIds.length === missions.length && missions.length > 0 ? (
                  <>
                    <CheckSquare size={14} /> <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square size={14} /> <span>Select All ({missions.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* BULK ACTION BAR (Visible when items selected) */}
          {selectedIds.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                padding: '12px 18px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1.5px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '12px',
                marginBottom: '16px',
                animation: 'fadeIn 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Trash2 size={16} color="#EF4444" />
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#EF4444' }}>
                  {selectedIds.length} Mission{selectedIds.length > 1 ? 's' : ''} Selected
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  style={{
                    padding: '6px 14px',
                    background: 'transparent',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#E8E3D5',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkDelete}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '6px 18px',
                    background: '#EF4444',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#FFFFFF',
                    fontSize: '12px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(239, 68, 68, 0.4)',
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete Selected ({selectedIds.length}) in One Click</span>
                </button>
              </div>
            </div>
          )}

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th style={{ width: '90px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="checkbox"
                        checked={missions.length > 0 && selectedIds.length === missions.length}
                        onChange={handleSelectAll}
                        style={{ width: '15px', height: '15px', accentColor: '#A9DDD3', cursor: 'pointer' }}
                        title="Select All"
                      />
                      <span>Order</span>
                    </div>
                  </th>
                  <th>Day / Date</th>
                  <th>Title & Content</th>
                  <th>Type & SS</th>
                  <th>Reward</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {missions.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: '32px 0', textAlign: 'center', color: 'rgba(232, 227, 213, 0.4)' }}>
                      No missions in database. Click "Auto Pre-Schedule 30 Days" above to initialize.
                    </td>
                  </tr>
                ) : (
                  missions.map((m, idx) => {
                    const isSelected = selectedIds.includes(m.id);
                    const isDragOver = dragOverIndex === idx;
                    return (
                      <tr
                        key={m.id}
                        draggable
                        onDragStart={() => setDraggedIndex(idx)}
                        onDragOver={(e) => {
                          e.preventDefault();
                          setDragOverIndex(idx);
                        }}
                        onDragEnd={() => handleDropReorder()}
                        onDrop={(e) => {
                          e.preventDefault();
                          handleDropReorder();
                        }}
                        style={{
                          background: isSelected
                            ? 'rgba(239, 68, 68, 0.08)'
                            : isDragOver
                            ? 'rgba(169, 221, 211, 0.15)'
                            : undefined,
                          borderLeft: isDragOver ? '3px solid #A9DDD3' : undefined,
                          transition: 'background 0.15s ease',
                        }}
                      >
                        {/* SELECT CHECKBOX & DRAG CONTROLS */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', userSelect: 'none' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleSelect(m.id)}
                              style={{ width: '16px', height: '16px', accentColor: '#A9DDD3', cursor: 'pointer' }}
                              title="Select row"
                            />
                            {/* Drag Grip Handle */}
                            <div
                              title="Drag upward or downward to reorder"
                              style={{ cursor: 'grab', display: 'flex', alignItems: 'center', color: 'rgba(169, 221, 211, 0.6)' }}
                            >
                              <GripVertical size={16} />
                            </div>
                            {/* Up / Down Arrow Click Controls */}
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleDropReorder(idx, idx - 1)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: idx === 0 ? 'rgba(255, 255, 255, 0.1)' : '#A9DDD3',
                                  cursor: idx === 0 ? 'default' : 'pointer',
                                  padding: 0,
                                  lineHeight: 1,
                                }}
                                title="Move Upward"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button
                                type="button"
                                disabled={idx === missions.length - 1}
                                onClick={() => handleDropReorder(idx, idx + 1)}
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: idx === missions.length - 1 ? 'rgba(255, 255, 255, 0.1)' : '#A9DDD3',
                                  cursor: idx === missions.length - 1 ? 'default' : 'pointer',
                                  padding: 0,
                                  lineHeight: 1,
                                }}
                                title="Move Downward"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>
                          </div>
                        </td>

                        {/* DAY / DATE */}
                        <td>
                          <div style={{ fontWeight: 800, color: '#E8E3D5' }}>Day {m.dayNumber}</div>
                          <div style={{ fontSize: '11px', color: 'rgba(232, 227, 213, 0.45)', fontFamily: 'var(--font-mono)' }}>{m.scheduledDate}</div>
                        </td>

                        {/* TITLE & CONTENT */}
                        <td>
                          <div style={{ fontWeight: 700, color: '#E8E3D5' }}>{m.title}</div>
                          {m.quizQuestion && (
                            <div style={{ fontSize: '11px', color: '#A9DDD3', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <HelpCircle size={11} /> Q: {m.quizQuestion}
                            </div>
                          )}
                          {m.quizQuestions && m.quizQuestions.length > 1 && (
                            <div style={{ fontSize: '10px', color: '#BCEAE1', marginTop: '2px', fontWeight: 700 }}>
                              ⚡ Multi-Question Quiz ({m.quizQuestions.length} Questions)
                            </div>
                          )}
                          {m.link && (
                            <a
                              href={m.link}
                              target="_blank"
                              rel="noreferrer"
                              style={{ fontSize: '11px', color: '#A9DDD3', display: 'inline-flex', alignItems: 'center', gap: '4px', textDecoration: 'none', marginTop: '2px' }}
                            >
                              <span>{m.link}</span>
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </td>

                        {/* TYPE & SS BADGES */}
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                            <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', padding: '3px 8px', background: m.type === 'quiz' ? 'rgba(169, 221, 211, 0.15)' : 'rgba(255, 255, 255, 0.08)', border: m.type === 'quiz' ? '1px solid rgba(169, 221, 211, 0.35)' : 'none', borderRadius: '6px', color: m.type === 'quiz' ? '#A9DDD3' : '#E8E3D5' }}>
                              {m.type}
                            </span>
                            {m.screenshotRequirement === 'mandatory' ? (
                              <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '4px', color: '#EF4444' }}>
                                SS: Mandatory
                              </span>
                            ) : m.screenshotRequirement === 'optional' ? (
                              <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', background: 'rgba(169, 221, 211, 0.15)', border: '1px solid rgba(169, 221, 211, 0.3)', borderRadius: '4px', color: '#A9DDD3' }}>
                                SS: Optional
                              </span>
                            ) : null}
                {/* System Notice Specific Severity & Quick Presets */}
                {broadcastType === 'system_notice' ? (
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#FBBF24', display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>
                      NOTICE SEVERITY & STATUS TYPE
                    </label>
                    <select
                      value={noticeSeverity}
                      onChange={(e) => {
                        const sev = e.target.value as any;
                        setNoticeSeverity(sev);
                        if (sev === 'maintenance') {
                          setBcastIcon('⚠️');
                          setBcastTitle('Scheduled System Maintenance');
                          setBcastMessage('Infrastructure upgrade in progress. Sub-second cluster optimization.');
                        } else if (sev === 'critical') {
                          setBcastIcon('🚨');
                          setBcastTitle('Emergency Network Synchronization');
                          setBcastMessage('Validators performing critical consensus check. Transactions paused temporarily.');
                        } else if (sev === 'upgrade') {
                          setBcastIcon('⚡');
                          setBcastTitle('Gauss Protocol Upgrade Live');
                          setBcastMessage('New state transitions active! Enjoy enhanced zero-friction speed.');
                        } else {
                          setBcastIcon('📢');
                          setBcastTitle('Community Ecosystem Announcement');
                        }
                      }}
                      className="admin-input"
                      style={{ width: '100%', background: 'rgba(2, 4, 6, 0.95)', cursor: 'pointer', padding: '10px 14px', border: '1px solid rgba(251, 191, 36, 0.4)' }}
                    >
                      <option value="maintenance">⚠️ Scheduled System Maintenance (Downtime Notice)</option>
                      <option value="critical">🚨 Critical Emergency / Service Alert</option>
                      <option value="upgrade">⚡ Protocol Upgrade & Release Milestone</option>
                      <option value="announcement">📢 General Community Announcement</option>
                    </select>

                    <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
                      {[
                        { label: '⚠️ 30m Maintenance', title: 'Scheduled System Maintenance (30m)', msg: 'Estimated downtime: 30 minutes. All user vaults remain secure.' },
                        { label: '⚡ Gauss Upgrade', title: 'Gauss Protocol Upgrade Active', msg: 'Zero-friction performance enhanced across all 30 card archetypes.' },
                        { label: '🚨 Validator Sync', title: 'Emergency Validator Synchronization', msg: 'Network temporarily verifying block state.' },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => {
                            setBcastTitle(preset.title);
                            setBcastMessage(preset.msg);
                          }}
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: 'rgba(251, 191, 36, 0.1)',
                            border: '1px solid rgba(251, 191, 36, 0.3)',
                            color: '#FBBF24',
                            cursor: 'pointer',
                          }}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                          </div>
                        </td>

                        {/* REWARD */}
                        <td>
                          <span style={{ fontWeight: 800, color: '#A9DDD3', fontFamily: 'var(--font-mono)' }}>+{m.rewardShards} Shards</span>
                        </td>

                        {/* STATUS */}
                        <td>
                          <button
                            type="button"
                            onClick={() => handleToggleActive(m)}
                            style={{
                              padding: '4px 10px',
                              fontSize: '11px',
                              fontWeight: 700,
                              borderRadius: '8px',
                              border: 'none',
                              cursor: 'pointer',
                              background: m.isActive ? 'rgba(169, 221, 211, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                              color: m.isActive ? '#A9DDD3' : '#EF4444',
                            }}
                          >
                            {m.isActive ? 'Active' : 'Paused'}
                          </button>
                        </td>

                        {/* ACTIONS - IMMEDIATE WORKING DELETE */}
                        <td>
                          <button
                            type="button"
                            onClick={() => handleDeleteMission(m.id)}
                            style={{
                              background: 'rgba(239, 68, 68, 0.12)',
                              border: '1px solid rgba(239, 68, 68, 0.3)',
                              borderRadius: '8px',
                              color: '#EF4444',
                              cursor: 'pointer',
                              padding: '6px 10px',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                            }}
                            title="Delete this mission immediately"
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
        </>
      )}

      {/* ========================================================
          TAB 2: BROADCAST ACHIEVEMENTS & COMMUNITY FEATS
          ======================================================== */}
      {activeAdminTab === 'broadcast' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {bcastActionMsg && (
            <div style={{
              padding: '14px 20px',
              background: 'rgba(169, 221, 211, 0.15)',
              border: '1.5px solid #A9DDD3',
              borderRadius: '16px',
              color: '#A9DDD3',
              fontSize: '13px',
              fontWeight: 800,
              boxShadow: '0 0 20px rgba(169, 221, 211, 0.2)',
            }}>
              {bcastActionMsg}
            </div>
          )}

          {/* Section Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(8, 14, 20, 0.95) 0%, rgba(3, 6, 10, 0.98) 100%)',
            border: '1.5px solid rgba(169, 221, 211, 0.3)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8), 0 0 30px rgba(169, 221, 211, 0.08)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #A9DDD3, #6EBBAE)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 0 15px rgba(169, 221, 211, 0.4)',
              }}>
                📢
              </div>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#E8E3D5', margin: 0 }}>
                  Superconducting <span className="gradient-text-rialo">Broadcast Beacon</span>
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(232, 227, 213, 0.7)', margin: '4px 0 0' }}>
                  Dispatch platform achievements, credit Superconducting Shards directly, and broadcast real-time celebratory announcements to @yournahian or all players.
                </p>
              </div>
            </div>
          </div>

          {/* Main 2-Column Console: Form + Live Preview */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
          }}>
            {/* Left Column: Broadcast Dispatch Console */}
            <div style={{
              background: 'rgba(6, 10, 10, 0.95)',
              border: '1px solid rgba(169, 221, 211, 0.22)',
              borderRadius: '20px',
              padding: '24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <Trophy size={18} color="#A9DDD3" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#E8E3D5', margin: 0 }}>
                  Configure Broadcast (Mission vs Achievement)
                </h3>
              </div>

              {/* Confirmation / Action Message Banner */}
              {bcastActionMsg && (
                <div style={{
                  padding: '14px 18px',
                  borderRadius: '14px',
                  background: bcastActionMsg.startsWith('✓') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: bcastActionMsg.startsWith('✓') ? '1.5px solid #10B981' : '1.5px solid #EF4444',
                  color: bcastActionMsg.startsWith('✓') ? '#A7F3D0' : '#FECACA',
                  fontSize: '13px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '10px',
                  boxShadow: bcastActionMsg.startsWith('✓') ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none',
                  marginBottom: '18px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={18} color={bcastActionMsg.startsWith('✓') ? '#10B981' : '#EF4444'} />
                    <span>{bcastActionMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setBcastActionMsg('')}
                    style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 0. BROADCAST TYPE SELECTOR (Mission vs Achievement) */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'block', marginBottom: '8px', letterSpacing: '0.04em' }}>
                    BROADCAST TYPE (CHOOSE PURPOSE)
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastType('mission');
                        setBcastTitle('Send 10 message in Trollbox');
                        setBcastDesc('Open Trollbox and Send 10 Message');
                        setBcastIcon('💬');
                        setBcastShards(250);
                        setMissionCategory('trollbox');
                        setTargetCount(10);
                        setBcastMessage('Use Trollbox Now!');
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: broadcastType === 'mission' ? 'linear-gradient(135deg, rgba(169, 221, 211, 0.25), rgba(6, 12, 16, 0.95))' : 'rgba(255,255,255,0.03)',
                        border: broadcastType === 'mission' ? '2px solid #A9DDD3' : '1px solid rgba(255,255,255,0.1)',
                        color: broadcastType === 'mission' ? '#A9DDD3' : '#8E9B97',
                        cursor: 'pointer',
                        fontWeight: 900,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      🎯 Mission
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastType('achievement');
                        handleSelectPreset(selectedPresetId);
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: broadcastType === 'achievement' ? 'linear-gradient(135deg, rgba(169, 221, 211, 0.25), rgba(6, 12, 16, 0.95))' : 'rgba(255,255,255,0.03)',
                        border: broadcastType === 'achievement' ? '2px solid #A9DDD3' : '1px solid rgba(255,255,255,0.1)',
                        color: broadcastType === 'achievement' ? '#A9DDD3' : '#8E9B97',
                        cursor: 'pointer',
                        fontWeight: 900,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      🏆 Achievement
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setBroadcastType('system_notice');
                        setNoticeSeverity('maintenance');
                        setBcastTitle('Scheduled System Maintenance');
                        setBcastDesc('Scheduled infrastructure upgrade in progress. Sub-second cluster optimization.');
                        setBcastIcon('⚠️');
                        setBcastShards(0);
                        setBcastRecipient('ALL PLAYERS');
                        setBcastMessage('Estimated Downtime: 30 minutes. All card states and shard vaults remain 100% secure.');
                      }}
                      style={{
                        padding: '12px',
                        borderRadius: '12px',
                        background: broadcastType === 'system_notice' ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.25), rgba(6, 12, 16, 0.95))' : 'rgba(255,255,255,0.03)',
                        border: broadcastType === 'system_notice' ? '2px solid #FBBF24' : '1px solid rgba(255,255,255,0.1)',
                        color: broadcastType === 'system_notice' ? '#FBBF24' : '#8E9B97',
                        cursor: 'pointer',
                        fontWeight: 900,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                      }}
                    >
                      ⚠️ System Notice
                    </button>
                  </div>
                </div>

                {/* Mission Specific Category & Presets */}
                {broadcastType === 'mission' ? (
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>
                      MISSION VERIFICATION CATEGORY & TARGET
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px', gap: '10px' }}>
                      <select
                        value={missionCategory}
                        onChange={(e) => setMissionCategory(e.target.value)}
                        className="admin-input"
                        style={{ width: '100%', background: 'rgba(2, 4, 6, 0.95)', cursor: 'pointer', padding: '10px 14px' }}
                      >
                        <option value="trollbox">💬 Trollbox Messages (Auto-tracked in live chat)</option>
                        <option value="quests">🚀 Daily Quests & Protocol Testing</option>
                        <option value="trade">🔄 P2P Card Trading with Community</option>
                        <option value="forge">🧪 Superconducting Forge Transmutation</option>
                        <option value="custom">⚡ Custom / External Community Feat</option>
                      </select>
                      <input
                        type="number"
                        value={targetCount}
                        onChange={(e) => setTargetCount(Number(e.target.value) || 1)}
                        placeholder="Count"
                        title="Target Count for verification (e.g. 10 messages)"
                        className="admin-input"
                        style={{ width: '100%', textAlign: 'center' }}
                      />
                    </div>
                  </div>
                ) : null}
                {/* Preset Dropdown */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'block', marginBottom: '6px', letterSpacing: '0.04em' }}>
                    1. SELECT PRESET ACHIEVEMENT (OR CUSTOM FEAT)
                  </label>
                  <select
                    value={selectedPresetId}
                    onChange={(e) => handleSelectPreset(e.target.value)}
                    className="admin-input"
                    style={{ width: '100%', background: 'rgba(2, 4, 6, 0.95)', cursor: 'pointer', padding: '10px 14px' }}
                  >
                    <option value="custom">✨ Custom Special Protocol Honor / Feat</option>
                    <optgroup label="🚀 Quests & Genesis (6)">
                      {PLATFORM_ACHIEVEMENTS.filter(a => a.category === 'quests').map(a => (
                        <option key={a.id} value={a.id}>{a.icon} {a.title} ({a.tier} - {a.shardsReward} Shards)</option>
                      ))}
                    </optgroup>
                    <optgroup label="🎴 Cards & Collecting (6)">
                      {PLATFORM_ACHIEVEMENTS.filter(a => a.category === 'cards').map(a => (
                        <option key={a.id} value={a.id}>{a.icon} {a.title} ({a.tier} - {a.shardsReward} Shards)</option>
                      ))}
                    </optgroup>
                    <optgroup label="🧪 The Superconducting Forge (4)">
                      {PLATFORM_ACHIEVEMENTS.filter(a => a.category === 'forge').map(a => (
                        <option key={a.id} value={a.id}>{a.icon} {a.title} ({a.tier} - {a.shardsReward} Shards)</option>
                      ))}
                    </optgroup>
                    <optgroup label="🔄 P2P Trading (4)">
                      {PLATFORM_ACHIEVEMENTS.filter(a => a.category === 'trading').map(a => (
                        <option key={a.id} value={a.id}>{a.icon} {a.title} ({a.tier} - {a.shardsReward} Shards)</option>
                      ))}
                    </optgroup>
                    <optgroup label="🕹️ Arcade & Sound Lab (4)">
                      {PLATFORM_ACHIEVEMENTS.filter(a => a.category === 'arcade').map(a => (
                        <option key={a.id} value={a.id}>{a.icon} {a.title} ({a.tier} - {a.shardsReward} Shards)</option>
                      ))}
                    </optgroup>
                    <optgroup label="👑 Prestige & Community (6)">
                      {PLATFORM_ACHIEVEMENTS.filter(a => a.category === 'prestige' || a.category === 'community').map(a => (
                        <option key={a.id} value={a.id}>{a.icon} {a.title} ({a.tier} - {a.shardsReward} Shards)</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Recipient Handle */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', letterSpacing: '0.04em' }}>
                      2. RECIPIENT TARGET (HANDLE OR GLOBAL)
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {['@yournahian', 'ALL PLAYERS', '@rialo_whale'].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setBcastRecipient(chip)}
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '6px',
                            background: bcastRecipient === chip ? '#A9DDD3' : 'rgba(255,255,255,0.06)',
                            color: bcastRecipient === chip ? '#010101' : '#8E9B97',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={bcastRecipient}
                    onChange={(e) => setBcastRecipient(e.target.value)}
                    placeholder="@yournahian or ALL PLAYERS"
                    className="admin-input"
                    style={{ width: '100%' }}
                    required
                  />
                  <p style={{ fontSize: '11px', color: 'rgba(232, 227, 213, 0.55)', margin: '4px 0 0' }}>
                    * If a specific user handle is targeted, Shards are immediately credited to their profile vault.
                  </p>
                </div>

                {/* Title & Icon Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'block', marginBottom: '6px' }}>
                      ICON
                    </label>
                    <input
                      type="text"
                      value={bcastIcon}
                      onChange={(e) => setBcastIcon(e.target.value)}
                      className="admin-input"
                      style={{ width: '100%', textAlign: 'center', fontSize: '18px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'block', marginBottom: '6px' }}>
                      ACHIEVEMENT TITLE
                    </label>
                    <input
                      type="text"
                      value={bcastTitle}
                      onChange={(e) => setBcastTitle(e.target.value)}
                      placeholder="e.g. Genesis Pioneer"
                      className="admin-input"
                      style={{ width: '100%' }}
                      required
                    />
                  </div>
                </div>

                {/* Quick Emoji Bar */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['🏆', '👑', '💎', '⚡', '🚀', '🎴', '🧪', '🔥', '🌟', '🤝', '🕹️', '🎹'].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setBcastIcon(em)}
                      style={{
                        padding: '4px 8px',
                        background: bcastIcon === em ? 'rgba(169, 221, 211, 0.3)' : 'rgba(255,255,255,0.04)',
                        border: bcastIcon === em ? '1px solid #A9DDD3' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '8px',
                        fontSize: '16px',
                        cursor: 'pointer',
                      }}
                    >
                      {em}
                    </button>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'block', marginBottom: '6px' }}>
                    DESCRIPTION / CRITERIA
                  </label>
                  <input
                    type="text"
                    value={bcastDesc}
                    onChange={(e) => setBcastDesc(e.target.value)}
                    placeholder="Achievement details or criteria..."
                    className="admin-input"
                    style={{ width: '100%' }}
                  />
                </div>

                {/* Tier & Shards Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'block', marginBottom: '6px' }}>
                      TIER BADGE
                    </label>
                    <select
                      value={bcastTier}
                      onChange={(e) => setBcastTier(e.target.value as any)}
                      className="admin-input"
                      style={{ width: '100%', background: 'rgba(2, 4, 6, 0.95)', cursor: 'pointer' }}
                    >
                      <option value="Bronze">Bronze (Common)</option>
                      <option value="Silver">Silver (Rare)</option>
                      <option value="Gold">Gold (Epic)</option>
                      <option value="Platinum">Platinum (Legendary)</option>
                      <option value="Diamond">Diamond (Ascendant)</option>
                      <option value="Mythic">Mythic (Supreme)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'block', marginBottom: '6px' }}>
                      SHARDS DROP (+💎)
                    </label>
                    <input
                      type="number"
                      value={bcastShards}
                      onChange={(e) => setBcastShards(Number(e.target.value) || 0)}
                      className="admin-input"
                      style={{ width: '100%' }}
                    />
                  </div>
                </div>

                {/* Custom Announcement Message */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'block', marginBottom: '6px' }}>
                    ADMIN BROADCAST ANNOUNCEMENT MESSAGE
                  </label>
                  <textarea
                    value={bcastMessage}
                    onChange={(e) => setBcastMessage(e.target.value)}
                    rows={2}
                    placeholder="Celebratory quote or note to accompany the live broadcast..."
                    className="admin-input"
                    style={{ width: '100%', resize: 'none' }}
                  />
                </div>

                {/* Action Submit Button */}
                <button
                  type="submit"
                  disabled={isBroadcasting}
                  style={{
                    marginTop: '8px',
                    height: '48px',
                    background: isBroadcasting ? 'rgba(169, 221, 211, 0.5)' : 'linear-gradient(135deg, #A9DDD3 0%, #6EBBAE 100%)',
                    border: 'none',
                    borderRadius: '14px',
                    color: '#010101',
                    fontSize: '14px',
                    fontWeight: 900,
                    cursor: isBroadcasting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 6px 20px rgba(169, 221, 211, 0.45)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                >
                  <Megaphone size={18} />
                  <span>{isBroadcasting ? 'Dispatching Broadcast...' : broadcastType === 'mission' ? '📢 Broadcast Mission to Community' : broadcastType === 'system_notice' ? '📢 Broadcast System Notice to Community' : '📢 Broadcast Achievement to Community'}</span>
                </button>
              </form>
            </div>

            {/* Right Column: Live Frontend Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Preview Card Box */}
              <div style={{
                background: 'rgba(6, 10, 10, 0.95)',
                border: '1px solid rgba(169, 221, 211, 0.22)',
                borderRadius: '20px',
                padding: '24px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                  <Radio size={16} color="#A9DDD3" className="animate-pulse" />
                  <span style={{ fontSize: '11px', fontWeight: 900, color: '#A9DDD3', letterSpacing: '0.06em' }}>
                    LIVE USER-FACING BANNER PREVIEW
                  </span>
                </div>

                {/* Mock Banner */}
                <div style={{
                  background: 'linear-gradient(135deg, rgba(169, 221, 211, 0.12) 0%, rgba(6, 12, 16, 0.95) 100%)',
                  border: '1.5px solid #A9DDD3',
                  borderRadius: '18px',
                  padding: '16px 20px',
                  boxShadow: '0 10px 30px rgba(169, 221, 211, 0.2)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #A9DDD3, #6EBBAE)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '22px',
                      boxShadow: '0 0 15px rgba(169, 221, 211, 0.4)',
                    }}>
                      {bcastIcon || '🏆'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 900,
                          background: '#A9DDD3',
                          color: '#010101',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}>
                          {broadcastType === 'system_notice' ? 'SYSTEM & PROTOCOL ALERT' : broadcastType === 'mission' ? 'PROTOCOL MISSION' : 'PROTOCOL ACHIEVEMENT'}
                        </span>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#E8E3D5',
                          background: 'rgba(255, 255, 255, 0.1)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}>
                          {bcastRecipient}
                        </span>
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 900,
                          color: '#FBBF24',
                          background: 'rgba(251, 191, 36, 0.15)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}>
                          {bcastTier}
                        </span>
                      </div>

                      <div style={{ fontSize: '14px', fontWeight: 900, color: '#E8E3D5' }}>
                        {bcastTitle}
                        {bcastShards > 0 && (
                          <span style={{ color: '#A9DDD3', marginLeft: '6px', fontSize: '13px' }}>
                            (+{bcastShards} Shards Drop)
                          </span>
                        )}
                      </div>

                      {bcastMessage && (
                        <div style={{ fontSize: '11px', color: 'rgba(232, 227, 213, 0.8)', marginTop: '2px', fontStyle: 'italic' }}>
                          "{bcastMessage}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Telemetry Details */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  marginTop: '18px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                }}>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#8E9B97', fontWeight: 700 }}>RECIPIENT</div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#A9DDD3', marginTop: '2px' }}>{bcastRecipient}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '10px', color: '#8E9B97', fontWeight: 700 }}>AUTO-CREDIT SHARDS</div>
                    <div style={{ fontSize: '13px', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>+{bcastShards} 💎</div>
                  </div>
                </div>
              </div>

              {/* Protocol Broadcast Beacon Info Box */}
              <div style={{
                background: 'rgba(6, 10, 10, 0.7)',
                border: '1px solid rgba(169, 221, 211, 0.15)',
                borderRadius: '16px',
                padding: '20px',
              }}>
                <div style={{ fontSize: '12px', fontWeight: 800, color: '#A9DDD3', marginBottom: '6px' }}>
                  ℹ️ HOW THE BROADCAST BEACON OPERATES
                </div>
                <ul style={{ fontSize: '12px', color: '#8E9B97', margin: 0, paddingLeft: '18px', lineHeight: 1.6 }}>
                  <li>When broadcasted, the event is immediately pushed to the decentralized protocol feed.</li>
                  <li>Users visiting RialoTrace see a glowing celebration banner with your announcement quote.</li>
                  <li>If targeting a specific user (like <code style={{ color: '#A9DDD3' }}>@yournahian</code>), their shard balance is directly credited in real-time.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Ledger: Recent Broadcast History */}
          <div style={{
            background: 'rgba(6, 10, 10, 0.95)',
            border: '1px solid rgba(169, 221, 211, 0.22)',
            borderRadius: '20px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Bell size={18} color="#A9DDD3" />
                <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#E8E3D5', margin: 0 }}>
                  Recent Broadcasts Ledger ({broadcastHistory.length} Logged)
                </h3>
              </div>

              <button
                type="button"
                onClick={fetchBroadcastHistory}
                style={{
                  padding: '6px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(169, 221, 211, 0.3)',
                  borderRadius: '10px',
                  color: '#A9DDD3',
                  fontSize: '11px',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <RefreshCw size={13} /> Refresh Ledger
              </button>
            </div>

            {broadcastHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 20px', color: '#8E9B97', fontSize: '13px' }}>
                No achievements broadcasted yet. Use the form above to dispatch your first community achievement broadcast!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {broadcastHistory.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(169, 221, 211, 0.12)',
                      borderRadius: '14px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '240px' }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '10px',
                        background: 'rgba(169, 221, 211, 0.15)',
                        border: '1px solid rgba(169, 221, 211, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        flexShrink: 0,
                      }}>
                        {b.icon}
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '14px', fontWeight: 900, color: '#E8E3D5' }}>
                            {b.title}
                          </span>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: 'rgba(169, 221, 211, 0.15)',
                            color: '#A9DDD3',
                          }}>
                            {b.tier}
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#FBBF24',
                          }}>
                            +{b.shardsReward} Shards
                          </span>
                        </div>

                        <div style={{ fontSize: '12px', color: '#8E9B97', marginTop: '2px' }}>
                          Target: <strong style={{ color: '#E8E3D5' }}>{b.recipient}</strong> {b.message && `— "${b.message}"`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#64748B' }}>
                        {new Date(b.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteBroadcast(b.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.1)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: '8px',
                          color: '#EF4444',
                          cursor: 'pointer',
                          padding: '6px 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700,
                        }}
                        title="Delete from broadcast ledger"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: GIFT CARDS TO ANY USER (AIRDROP ENCLAVE)
          ======================================================== */}
      {activeAdminTab === 'gift' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {giftActionMsg && (
            <div style={{
              padding: '14px 20px',
              background: 'rgba(16, 185, 129, 0.15)',
              border: '1.5px solid #10B981',
              borderRadius: '16px',
              color: '#34D399',
              fontSize: '13px',
              fontWeight: 800,
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.25)',
            }}>
              {giftActionMsg}
            </div>
          )}

          {/* Section Hero Banner */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(8, 20, 16, 0.95) 0%, rgba(3, 10, 8, 0.98) 100%)',
            border: '1.5px solid rgba(16, 185, 129, 0.35)',
            borderRadius: '24px',
            padding: '28px',
            boxShadow: '0 20px 45px rgba(0, 0, 0, 0.8), 0 0 30px rgba(16, 185, 129, 0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '8px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #10B981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                boxShadow: '0 0 15px rgba(16, 185, 129, 0.45)',
              }}>
                🎁
              </div>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#E8E3D5', margin: 0 }}>
                  Genesis Card Vault & <span className="gradient-text-rialo">Player Airdrop Studio</span>
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(232, 227, 213, 0.7)', margin: '4px 0 0' }}>
                  Directly grant any of the 30 Genesis Protocol Warrior cards to any player handle. Instant binder delivery, +50 points per card, and real-time ledger tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '24px',
          }}>
            {/* Left Column: Interactive Card Picker */}
            <div style={{
              background: 'rgba(6, 10, 10, 0.95)',
              border: '1px solid rgba(169, 221, 211, 0.22)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Sparkles size={18} color="#10B981" />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#E8E3D5', margin: 0 }}>
                    1. Select Card to Gift
                  </h3>
                </div>
                <span style={{ fontSize: '11px', color: '#A9DDD3', fontWeight: 700 }}>
                  30 Archetypes Available
                </span>
              </div>

              {/* Rarity Filter Tabs */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC'].map((rarity) => {
                  const isSelected = giftRarityFilter === rarity;
                  let color = '#94A3B8';
                  if (rarity === 'COMMON') color = '#94A3B8';
                  if (rarity === 'RARE') color = '#3B82F6';
                  if (rarity === 'EPIC') color = '#10B981';
                  if (rarity === 'LEGENDARY') color = '#F59E0B';
                  if (rarity === 'MYTHIC') color = '#EC4899';

                  return (
                    <button
                      key={rarity}
                      type="button"
                      onClick={() => setGiftRarityFilter(rarity)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 800,
                        cursor: 'pointer',
                        background: isSelected ? 'rgba(169, 221, 211, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? `1px solid ${color}` : '1px solid rgba(255, 255, 255, 0.08)',
                        color: isSelected ? '#FFFFFF' : '#8E9B97',
                        transition: 'all 0.15s',
                      }}
                    >
                      {rarity}
                    </button>
                  );
                })}
              </div>

              {/* Search Input */}
              <div style={{ position: 'relative' }}>
                <Search size={14} color="#8E9B97" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  placeholder="Search cards by name or archetype..."
                  value={giftCardSearch}
                  onChange={(e) => setGiftCardSearch(e.target.value)}
                  className="admin-input"
                  style={{
                    width: '100%',
                    height: '38px',
                    paddingLeft: '34px',
                    fontSize: '12px',
                    background: 'rgba(12, 16, 16, 0.9)',
                    border: '1px solid rgba(169, 221, 211, 0.2)',
                    borderRadius: '10px',
                    color: '#FFFFFF',
                  }}
                />
              </div>

              {/* Scrollable Card Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                gap: '10px',
                maxHeight: '440px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}>
                {ALL_30_CARDS
                  .filter((card) => {
                    const matchesRarity = giftRarityFilter === 'ALL' || card.rarity === giftRarityFilter;
                    const matchesSearch = !giftCardSearch.trim() ||
                      card.title.toLowerCase().includes(giftCardSearch.toLowerCase()) ||
                      card.id.toLowerCase().includes(giftCardSearch.toLowerCase());
                    return matchesRarity && matchesSearch;
                  })
                  .map((card) => {
                    const isSelected = giftSelectedCardId === card.id;
                    let glowBorder = 'rgba(255, 255, 255, 0.08)';
                    let tagBg = 'rgba(148, 163, 184, 0.15)';
                    let tagColor = '#94A3B8';

                    if (card.rarity === 'MYTHIC') {
                      tagBg = 'rgba(236, 72, 153, 0.2)';
                      tagColor = '#F472B6';
                      if (isSelected) glowBorder = '#EC4899';
                    } else if (card.rarity === 'LEGENDARY') {
                      tagBg = 'rgba(245, 158, 11, 0.2)';
                      tagColor = '#FBBF24';
                      if (isSelected) glowBorder = '#F59E0B';
                    } else if (card.rarity === 'EPIC') {
                      tagBg = 'rgba(16, 185, 129, 0.2)';
                      tagColor = '#34D399';
                      if (isSelected) glowBorder = '#10B981';
                    } else if (card.rarity === 'RARE') {
                      tagBg = 'rgba(59, 130, 246, 0.2)';
                      tagColor = '#60A5FA';
                      if (isSelected) glowBorder = '#3B82F6';
                    } else {
                      if (isSelected) glowBorder = '#A9DDD3';
                    }

                    return (
                      <div
                        key={card.id}
                        onClick={() => setGiftSelectedCardId(card.id)}
                        style={{
                          background: isSelected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(12, 16, 16, 0.8)',
                          border: `1.5px solid ${isSelected ? glowBorder : 'rgba(255, 255, 255, 0.08)'}`,
                          borderRadius: '12px',
                          padding: '10px 8px',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          position: 'relative',
                          transition: 'all 0.18s ease',
                          boxShadow: isSelected ? `0 0 16px ${glowBorder}40` : 'none',
                          transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                        }}
                      >
                        {isSelected && (
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: '#10B981',
                            borderRadius: '50%',
                            width: '18px',
                            height: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#000000',
                          }}>
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}

                        <div style={{
                          width: '56px',
                          height: '56px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          marginBottom: '8px',
                          background: 'rgba(0, 0, 0, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <img
                            src={card.image}
                            alt={card.title}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <div style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          color: '#E8E3D5',
                          lineHeight: '1.2',
                          marginBottom: '4px',
                          maxHeight: '28px',
                          overflow: 'hidden',
                        }}>
                          {card.badgeEmoji} {card.title}
                        </div>

                        <span style={{
                          fontSize: '9px',
                          fontWeight: 800,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: tagBg,
                          color: tagColor,
                        }}>
                          {card.rarity}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Right Column: Recipient Form & Live Holographic Card Preview */}
            <div style={{
              background: 'rgba(6, 10, 10, 0.95)',
              border: '1px solid rgba(169, 221, 211, 0.22)',
              borderRadius: '20px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={18} color="#10B981" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#E8E3D5', margin: 0 }}>
                  2. Airdrop Recipient & Parameters
                </h3>
              </div>

              <form onSubmit={handleSendGift} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Recipient Handle */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'block', marginBottom: '6px' }}>
                    TARGET RECIPIENT HANDLE
                  </label>
                  <div style={{ position: 'relative' }}>
                    <span style={{ position: 'absolute', left: '14px', top: '12px', color: '#10B981', fontWeight: 800, fontSize: '14px' }}>@</span>
                    <input
                      type="text"
                      value={giftRecipient.startsWith('@') ? giftRecipient.slice(1) : giftRecipient}
                      onChange={(e) => setGiftRecipient('@' + e.target.value.replace('@', '').trim())}
                      placeholder="username (e.g. yournahian)"
                      className="admin-input"
                      style={{
                        width: '100%',
                        height: '42px',
                        paddingLeft: '32px',
                        background: 'rgba(12, 16, 16, 0.9)',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        borderRadius: '10px',
                        color: '#FFFFFF',
                        fontWeight: 700,
                      }}
                    />
                  </div>

                  {/* Registered Users Quick Select Chips */}
                  {registeredUsers.length > 0 && (
                    <div style={{ marginTop: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#8E9B97', display: 'block', marginBottom: '4px' }}>
                        Quick Select Registered Player:
                      </span>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', maxHeight: '60px', overflowY: 'auto' }}>
                        {registeredUsers.map((u) => {
                          const isSelected = giftRecipient.toLowerCase().replace('@', '') === u.username.toLowerCase();
                          return (
                            <button
                              key={u.username}
                              type="button"
                              onClick={() => setGiftRecipient('@' + u.username)}
                              style={{
                                padding: '3px 8px',
                                borderRadius: '6px',
                                fontSize: '10px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                background: isSelected ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
                                color: isSelected ? '#000000' : '#A9DDD3',
                                border: '1px solid rgba(169, 221, 211, 0.2)',
                                transition: 'all 0.15s',
                              }}
                            >
                              @{u.username} ({u.totalCardsCount} cards)
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Live Target User Inventory Status */}
                  {(() => {
                    const clean = giftRecipient.toLowerCase().replace('@', '');
                    const found = registeredUsers.find((u) => u.username.toLowerCase() === clean);
                    const cardCopies = found?.inventory?.[giftSelectedCardId] || 0;

                    if (found) {
                      return (
                        <div style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#A9DDD3',
                        }}>
                          👤 <strong>@{found.username}</strong> currently has <strong>{cardCopies}x</strong> copies of this card ({found.totalCardsCount} total cards • {found.lifetimePoints} pts).
                        </div>
                      );
                    } else if (clean) {
                      return (
                        <div style={{
                          marginTop: '8px',
                          padding: '6px 12px',
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.25)',
                          borderRadius: '8px',
                          fontSize: '11px',
                          color: '#93C5FD',
                        }}>
                          ✨ New player handle <strong>@{clean}</strong> — binder will be initialized and card delivered instantly.
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Quantity Selector */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'block', marginBottom: '6px' }}>
                    QUANTITY TO GIFT
                  </label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[1, 2, 3, 5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setGiftQuantity(num)}
                        style={{
                          flex: 1,
                          height: '36px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 800,
                          cursor: 'pointer',
                          background: giftQuantity === num ? '#10B981' : 'rgba(255, 255, 255, 0.05)',
                          color: giftQuantity === num ? '#000000' : '#E8E3D5',
                          border: giftQuantity === num ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.1)',
                          transition: 'all 0.15s',
                        }}
                      >
                        +{num}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason Presets & Input */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 800, color: '#A9DDD3', display: 'block', marginBottom: '6px' }}>
                    AIRDROP REASON / PROTOCOL MEMO
                  </label>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
                    {[
                      '🏆 Community MVP',
                      '⚡ Testnet Vanguard',
                      '🎁 Special Alpha Giveaway',
                      '🛡️ Bug Bounty Reward',
                      '🚀 Welcome Gift',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setGiftReason(preset)}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '10px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: giftReason === preset ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                          border: giftReason === preset ? '1px solid #10B981' : '1px solid rgba(255, 255, 255, 0.08)',
                          color: giftReason === preset ? '#34D399' : '#8E9B97',
                        }}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={giftReason}
                    onChange={(e) => setGiftReason(e.target.value)}
                    placeholder="Enter reason or special note..."
                    className="admin-input"
                    style={{
                      width: '100%',
                      height: '38px',
                      background: 'rgba(12, 16, 16, 0.9)',
                      border: '1px solid rgba(169, 221, 211, 0.2)',
                      borderRadius: '10px',
                      color: '#FFFFFF',
                      fontSize: '12px',
                    }}
                  />
                </div>

                {/* Live Holographic Selected Card Preview */}
                {(() => {
                  const card = ALL_30_CARDS.find((c) => c.id === giftSelectedCardId) || ALL_30_CARDS[0];
                  let glowColor = '#10B981';
                  if (card.rarity === 'MYTHIC') glowColor = '#EC4899';
                  if (card.rarity === 'LEGENDARY') glowColor = '#F59E0B';
                  if (card.rarity === 'RARE') glowColor = '#3B82F6';

                  return (
                    <div style={{
                      background: 'linear-gradient(135deg, rgba(16, 24, 20, 0.9) 0%, rgba(8, 12, 10, 0.95) 100%)',
                      border: `1.5px solid ${glowColor}60`,
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      gap: '16px',
                      alignItems: 'center',
                      boxShadow: `0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px ${glowColor}25`,
                    }}>
                      <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        background: '#000',
                        flexShrink: 0,
                        border: `1px solid ${glowColor}`,
                      }}>
                        <img
                          src={card.image}
                          alt={card.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 900, color: '#FFFFFF' }}>
                            {card.title}
                          </span>
                          <span style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: `${glowColor}20`,
                            color: glowColor,
                            border: `1px solid ${glowColor}40`,
                          }}>
                            {card.rarity}
                          </span>
                        </div>

                        <p style={{
                          fontSize: '11px',
                          color: '#8E9B97',
                          margin: '0 0 8px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}>
                          {card.lore}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 900,
                            color: '#10B981',
                            background: 'rgba(16, 185, 129, 0.15)',
                            padding: '2px 8px',
                            borderRadius: '6px',
                          }}>
                            +{giftQuantity} Copy (x{giftQuantity})
                          </span>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 800,
                            color: '#FBBF24',
                          }}>
                            +{giftQuantity * 50} Whitelist Pts
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Dispatch Button */}
                <button
                  type="submit"
                  disabled={isGifting}
                  style={{
                    height: '48px',
                    padding: '0 24px',
                    borderRadius: '12px',
                    background: isGifting
                      ? 'rgba(16, 185, 129, 0.5)'
                      : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    border: '1px solid rgba(16, 185, 129, 0.6)',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 900,
                    cursor: isGifting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.45)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Sparkles size={18} className={isGifting ? 'animate-spin' : ''} />
                  <span>
                    {isGifting
                      ? 'Minting & Airdropping...'
                      : `Airdrop ${giftQuantity}x Card to ${giftRecipient}`}
                  </span>
                </button>
              </form>
            </div>
          </div>

          {/* Bottom Section: Protocol Gift Ledger / History */}
          <div style={{
            background: 'rgba(6, 10, 10, 0.95)',
            border: '1px solid rgba(169, 221, 211, 0.22)',
            borderRadius: '20px',
            padding: '24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Gift size={18} color="#10B981" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#E8E3D5', margin: 0 }}>
                  Recent Card Airdrops & Gift Ledger
                </h3>
              </div>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '2px 8px',
                borderRadius: '9999px',
              }}>
                {giftLogs.length} Total Airdrops
              </span>
            </div>

            {giftLogs.length === 0 ? (
              <div style={{
                padding: '36px',
                textAlign: 'center',
                color: '#8E9B97',
                fontSize: '13px',
                background: 'rgba(12, 16, 16, 0.5)',
                borderRadius: '12px',
                border: '1px dashed rgba(169, 221, 211, 0.15)',
              }}>
                No cards have been gifted yet. Use the console above to airdrop cards to players!
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {giftLogs.map((log) => {
                  let rarityColor = '#10B981';
                  if (log.cardRarity === 'MYTHIC') rarityColor = '#EC4899';
                  if (log.cardRarity === 'LEGENDARY') rarityColor = '#F59E0B';
                  if (log.cardRarity === 'RARE') rarityColor = '#3B82F6';

                  return (
                    <div
                      key={log.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'rgba(12, 16, 16, 0.8)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        gap: '12px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          background: '#000',
                          flexShrink: 0,
                          border: `1px solid ${rarityColor}60`,
                        }}>
                          <img
                            src={log.cardImage}
                            alt={log.cardTitle}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>

                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '13px', fontWeight: 900, color: '#E8E3D5' }}>
                              {log.cardTitle}
                            </span>
                            <span style={{
                              fontSize: '9px',
                              fontWeight: 800,
                              padding: '2px 6px',
                              borderRadius: '4px',
                              background: `${rarityColor}20`,
                              color: rarityColor,
                            }}>
                              {log.cardRarity}
                            </span>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              color: '#10B981',
                              background: 'rgba(16, 185, 129, 0.15)',
                              padding: '1px 6px',
                              borderRadius: '4px',
                            }}>
                              x{log.quantity}
                            </span>
                            <span style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              padding: '2px 7px',
                              borderRadius: '4px',
                              background: log.claimed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                              color: log.claimed ? '#10B981' : '#F59E0B',
                              border: log.claimed ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
                            }}>
                              {log.claimed ? '✓ Revealed in Binder' : '⏳ Awaiting Reveal in Missions'}
                            </span>
                          </div>

                          <div style={{ fontSize: '12px', color: '#8E9B97', marginTop: '3px' }}>
                            Recipient: <strong style={{ color: '#A9DDD3' }}>@{log.username}</strong>
                            {log.reason && ` • Memo: "${log.reason}"`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontSize: '11px', color: '#64748B' }}>
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            setGiftRecipient('@' + log.username);
                            setGiftSelectedCardId(log.cardId);
                          }}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            background: 'rgba(16, 185, 129, 0.15)',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            color: '#34D399',
                            cursor: 'pointer',
                          }}
                          title="Gift this card again"
                        >
                          Gift Again
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteGiftLog(log.id)}
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            borderRadius: '6px',
                            color: '#EF4444',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '11px',
                            fontWeight: 700,
                          }}
                          title="Remove from gift ledger"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      </div>
    </div>
  );
}
