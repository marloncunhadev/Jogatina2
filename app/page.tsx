'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  Users,
  PlusCircle,
  History as HistoryIcon,
  Play,
  Settings,
  Trophy,
  Plus,
  User,
  UserPlus,
  Edit2,
  Trash2,
  Star,
  MoreVertical,
  Eye,
  X,
  CheckCircle2,
  Timer,
  PartyPopper,
  Zap,
  HeartCrack,
  BarChart2,
  Check,
  RotateCcw,
  LogOut,
  Gamepad2,
  Sparkles
} from 'lucide-react';

import { supabase } from '../lib/supabase';
import AppLogo from '../components/AppLogo';

// Interfaces
interface Player {
  id: string;
  name: string;
  style: 'Agressivo' | 'Agressiva' | 'Conservador' | 'Equilibrado' | 'Coringa';
  avatar: string;
  totalWins: number;
  averageScore: number;
  lastPlayed: string;
  isCustom?: boolean;
}

interface Table {
  id: string;
  name: string;
  targetScore: number;
  maxRounds: number;
  currentRound: number;
  status: 'active' | 'completed';
  players: {
    id: string;
    name: string;
    avatar: string;
    score: number; // accumulated round points
    isBusted: boolean; // busted in current round
    history: number[]; // points locked in for each round
    totalScore: number; // sum of previous banked rounds + current round
  }[];
  activePlayerIndex: number;
  createdAt: string;
  gameTimeSeconds: number;
  game?: string;
}

interface MatchHistory {
  id: string;
  tableName: string;
  date: string;
  winnerName: string;
  winnerScore: number;
  playersCount: number;
  type: 'FLIP7' | 'Normal' | 'Epic';
  game?: string;
}

interface DBMatchHistory {
  id: string;
  matchId: string;
  date: string;
  tableName: string;
  playerName: string;
  playerId: string | null;
  score: number;
  isWinner: boolean;
  game: string;
  createdAt: string;
}


interface SimulatedTable {
  id: string;
  name: string;
  round: number;
  players: { name: string; score: number }[];
}

// Initial Data
const INITIAL_PLAYERS: Player[] = [
  {
    id: 'sora',
    name: 'Sora',
    style: 'Coringa',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6pa0w5xpTZvrK_3uvM1dVoxkye3hsEeSPbHjKscHfobDyn_1OPGmpPEpFuqLlB1cupPScEFS6Klv4UvmsJ1gksOkuPot9sgnCqIWZvpnONcvV3pR2z1QDu6c3jWxb4Wbu0Iet1DMhuXVvuNEpg2XHsQoW_vTEImQyOlhqfpOn-w70yfNBOmNe0iLweBemHQC4jfL6k2hz9VmumeZLYBnjOfEO6tv8s6yNrSOs_NOiDqtw7R7rjDehSw',
    totalWins: 42,
    averageScore: 156,
    lastPlayed: 'Ontem',
  },
  {
    id: 'leo',
    name: 'Leo',
    style: 'Equilibrado',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALr3M0R7WX9w0I18Zt_lPiE7GpggmvfxQ4kDxLM09MMVQebI_bnLDzBzoRcb7kymV5P8DcZ5S4spm3JetUQg9zDbueAwDSuSG8ww-SMZK2GltDWwt4kQqx-ipU0GGd4FrXnGklXKgOSQn9c8qj4Kwu8tEdVrLCcIxsnA3lfT4GKDnCSa3OB-7e5fUhCLwPGQ_hBQ4C6wouoVzRmQuy_8ALQ_FThrOqROIeLqQE2L72qsfidyGfTCr2FQ',
    totalWins: 28,
    averageScore: 132,
    lastPlayed: '3 dias atrás',
  },
  {
    id: 'maya',
    name: 'Maya',
    style: 'Agressiva',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8m_2_6IIJy1TTbhHrcHIUeG00aHs0g_HLzESHhHL3ei1am90AypSYcj3ToPlur5WtCNNffsj1bUJcDabDqUfSYBX8uJkkv_-hIiW5Dy0wMLJit3_1kb-ofO-r7ojEDuAxYLdACV_MFU-gIKktcGLdNnzTAiYlYM26MkzVskBt2-CAAirQnRHTb_mrTA3mn8Obs6jWFMa8DowHoynCNwrefXLVTsvBQINNh_G0zZ-_vNQ4rauhsUUp7w',
    totalWins: 15,
    averageScore: 184,
    lastPlayed: 'Hoje',
  },
  {
    id: 'alex',
    name: 'Alex "A"',
    style: 'Equilibrado',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaZ4tNKiAoYP0kwHUknsEVv98mctmG36cLK2fuDll4zckwqTl0dMrBrzoY_-tjG9Vjc7sPNcSS8J7wsgjTPf3yi5ONBkC8Pe43JDdIW5RUkNiTDmrGm49KnJviA4gINsn5xLaMlTpIP0KXYbq2OEdWMZPlKkfvgrIm72fngAqWQCCMpCgSeNG-G5uleX126_Yg_8IyFxdIAT4Tqdl7r--PhtcTF6nKVis-XT-qQgeE1jgGMgGpLg5XAg',
    totalWins: 35,
    averageScore: 148,
    lastPlayed: '2 semanas atrás',
  },
  {
    id: 'beatriz',
    name: 'Beatriz',
    style: 'Conservador',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXB6xyduz4RfBXW754t5m5r_czyPI_ZHyMqv-TiVa6EXvtD5vVybQYg0J4vBxntoiD6IwOHETzINFQazZdS3OeZg5ZtXu5d7za2NskKyIGosAnrDkiX0ERd7tm514euMNe1EwiPcHD6F8Tzkpoht1YwdDbXpUXKJkekOKu0DtivzQcpebX3t1veA76d-29OzCnkPD6fKjYTCC4zZrme4ETYlJXP1w6PeqU9XgiTaSNgDtf1hDfvVT0Yw',
    totalWins: 19,
    averageScore: 122,
    lastPlayed: '4 dias atrás',
  },
  {
    id: 'carlos',
    name: 'Carlos G.',
    style: 'Conservador',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAE1nvKimAgCLNKwsd8Wuwzk_MMJMg785Bg9AeN4pn9IQijUFfrA-Vgj-OFmXEwpLXxJ4R9NPSpud9FA538t7N3Z5d8U72Ka_edn8w_zuxMhoRcjTGaO_ECXH9XEnzjIwUIOiRY0AAgb-J7T1-5E0cwRA6aeK-4ZHPvuywC_k8OS5oE_Jft-CBnQfed9QruFgpiY8nRLFB8BR2Wg_OLIBqrRl1Vy3P7vHeN-VgsXEQ_u5TnLcs8fcI18Q',
    totalWins: 23,
    averageScore: 115,
    lastPlayed: 'Ontem',
  },
  {
    id: 'diana',
    name: 'Diana Z.',
    style: 'Coringa',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB5_tyXRXZi25g1bOE8uC8B1qm43fmOkiW9Nn7lgmeZJRN8i4H6x_A8SZMTQigTEVoBDq1zvQjV2pimicSEBZjI5L7mNYtam42j6ejd-Uwp71lBzPUljpg7bN35aaD3KA-JXHi0td-oyprb09spib6m72VUFGlKpeNOPMzYh0QB7DXLcdip9WtxT0hZR5rXJ7PxJl7GoZuEqHJFocKRTVZQvTBohD2aQFWu93ACFGmDe5rwkGpG-E1vuQ',
    totalWins: 30,
    averageScore: 140,
    lastPlayed: 'Hoje',
  },
  {
    id: 'eduardo',
    name: 'Eduardo',
    style: 'Equilibrado',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCDsF2Y-K_zyerOuJURBBAeBtCLRG5RE8wnwbIOfUVY-o-7u7O1HLaQhxrOPtrvJWhqQa3yFTvuqkbtPfA6srzxZwKZcYFlBLXyGz-lKY0qY1RWEKNn_B25mrpOMZSo4YXfgoRV9ypWNI99p1GbbEPW-_VwQYj6U5gYx_aG_hbjUr0wYFSVANrM0EASOAxd9J2ZcqpVaYCS7MmtoG1Mtpvo9kZdAvBSm4POf3Fv1blmiEmAQYe3luOwOQ',
    totalWins: 50,
    averageScore: 165,
    lastPlayed: 'Hoje',
  },
];

const PRESET_AVATARS: string[] = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuD6pa0w5xpTZvrK_3uvM1dVoxkye3hsEeSPbHjKscHfobDyn_1OPGmpPEpFuqLlB1cupPScEFS6Klv4UvmsJ1gksOkuPot9sgnCqIWZvpnONcvV3pR2z1QDu6c3jWxb4Wbu0Iet1DMhuXVvuNEpg2XHsQoW_vTEImQyOlhqfpOn-w70yfNBOmNe0iLweBemHQC4jfL6k2hz9VmumeZLYBnjOfEO6tv8s6yNrSOs_NOiDqtw7R7rjDehSw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuALr3M0R7WX9w0I18Zt_lPiE7GpggmvfxQ4kDxLM09MMVQebI_bnLDzBzoRcb7kymV5P8DcZ5S4spm3JetUQg9zDbueAwDSuSG8ww-SMZK2GltDWwt4kQqx-ipU0GGd4FrXnGklXKgOSQn9c8qj4Kwu8tEdVrLCcIxsnA3lfT4GKDnCSa3OB-7e5fUhCLwPGQ_hBQ4C6wouoVzRmQuy_8ALQ_FThrOqROIeLqQE2L72qsfidyGfTCr2FQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB8m_2_6IIJy1TTbhHrcHIUeG00aHs0g_HLzESHhHL3ei1am90AypSYcj3ToPlur5WtCNNffsj1bUJcDabDqUfSYBX8uJkkv_-hIiW5Dy0wMLJit3_1kb-ofO-r7ojEDuAxYLdACV_MFU-gIKktcGLdNnzTAiYlYM26MkzVskBt2-CAAirQnRHTb_mrTA3mn8Obs6jWFMa8DowHoynCNwrefXLVTsvBQINNh_G0zZ-_vNQ4rauhsUUp7w',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCaZ4tNKiAoYP0kwHUknsEVv98mctmG36cLK2fuDll4zckwqTl0dMrBrzoY_-tjG9Vjc7sPNcSS8J7wsgjTPf3yi5ONBkC8Pe43JDdIW5RUkNiTDmrGm49KnJviA4gINsn5xLaMlTpIP0KXYbq2OEdWMZPlKkfvgrIm72fngAqWQCCMpCgSeNG-G5uleX126_Yg_8IyFxdIAT4Tqdl7r--PhtcTF6nKVis-XT-qQgeE1jgGMgGpLg5XAg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCXB6xyduz4RfBXW754t5m5r_czyPI_ZHyMqv-TiVa6EXvtD5vVybQYg0J4vBxntoiD6IwOHETzINFQazZdS3OeZg5ZtXu5d7za2NskKyIGosAnrDkiX0ERd7tm514euMNe1EwiPcHD6F8Tzkpoht1YwdDbXpUXKJkekOKu0DtivzQcpebX3t1veA76d-29OzCnkPD6fKjYTCC4zZrme4ETYlJXP1w6PeqU9XgiTaSNgDtf1hDfvVT0Yw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAE1nvKimAgCLNKwsd8Wuwzk_MMJMg785Bg9AeN4pn9IQijUFfrA-Vgj-OFmXEwpLXxJ4R9NPSpud9FA538t7N3Z5d8U72Ka_edn8w_zuxMhoRcjTGaO_ECXH9XEnzjIwUIOiRY0AAgb-J7T1-5E0cwRA6aeK-4ZHPvuywC_k8OS5oE_Jft-CBnQfed9QruFgpiY8nRLFB8BR2Wg_OLIBqrRl1Vy3P7vHeN-VgsXEQ_u5TnLcs8fcI18Q',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB5_tyXRXZi25g1bOE8uC8B1qm43fmOkiW9Nn7lgmeZJRN8i4H6x_A8SZMTQigTEVoBDq1zvQjV2pimicSEBZjI5L7mNYtam42j6ejd-Uwp71lBzPUljpg7bN35aaD3KA-JXHi0td-oyprb09spib6m72VUFGlKpeNOPMzYh0QB7DXLcdip9WtxT0hZR5rXJ7PxJl7GoZuEqHJFocKRTVZQvTBohD2aQFWu93ACFGmDe5rwkGpG-E1vuQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCDsF2Y-K_zyerOuJURBBAeBtCLRG5RE8wnwbIOfUVY-o-7u7O1HLaQhxrOPtrvJWhqQa3yFTvuqkbtPfA6srzxZwKZcYFlBLXyGz-lKY0qY1RWEKNn_B25mrpOMZSo4YXfgoRV9ypWNI99p1GbbEPW-_VwQYj6U5gYx_aG_hbjUr0wYFSVANrM0EASOAxd9J2ZcqpVaYCS7MmtoG1Mtpvo9kZdAvBSm4POf3Fv1blmiEmAQYe3luOwOQ'
];

interface GameConfig {
  id: string;
  name: string;
  tagline: string;
  description: string;
  colorClass: string;
  badge: string;
  defaultTarget: number;
  defaultMaxRounds: number;
  imageUrl: string;
}

const GameIllustration = ({ gameId }: { gameId: string }) => {
  switch (gameId) {
    case 'flip7':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Background glow */}
          <circle cx="50" cy="50" r="45" fill="url(#flip7-glow)" opacity="0.35" />
          
          {/* Card 1 (Left, letter A) */}
          <g transform="rotate(-15 35 55)">
            <rect x="22" y="25" width="28" height="42" rx="4" fill="#14110F" stroke="#E28424" strokeWidth="1.5" />
            <text x="26" y="36" fill="#E28424" fontSize="8" fontFamily="system-ui, sans-serif" fontWeight="900">A</text>
            {/* Spade symbol mini */}
            <path d="M36 43 C34.5 43 33.5 44 33.5 45.5 C33.5 46.5 34.5 47.5 36 47.5 C37.5 47.5 38.5 46.5 38.5 45.5 C38.5 44 37.5 43 36 43 Z" fill="#E28424" opacity="0.8" />
            <path d="M35.5 45 L36.5 45 L36.7 49 L35.3 49 Z" fill="#E28424" opacity="0.8" />
          </g>

          {/* Card 2 (Middle, letter Q) */}
          <g transform="rotate(-5 45 53)">
            <rect x="32" y="22" width="28" height="42" rx="4" fill="#14110F" stroke="#F1A13C" strokeWidth="1.5" />
            <text x="36" y="33" fill="#F1A13C" fontSize="8" fontFamily="system-ui, sans-serif" fontWeight="900">Q</text>
            <circle cx="46" cy="43" r="3" stroke="#F1A13C" strokeWidth="1" fill="none" opacity="0.7" />
          </g>

          {/* Card 3 (Right, spade and 7/S) */}
          <g transform="rotate(10 58 55)">
            <rect x="44" y="23" width="28" height="42" rx="4" fill="#1C140E" stroke="#FFB03A" strokeWidth="2" />
            <text x="48" y="34" fill="#FFB03A" fontSize="8" fontFamily="system-ui, sans-serif" fontWeight="900">S</text>
            {/* Spade symbol in center */}
            <path d="M58 39 C55.5 39 54 41 54 43.5 C54 45.5 55.5 47 58 47 C60.5 47 62 45.5 62 43.5 C62 41 60.5 39 58 39 Z" fill="#FFB03A" />
            <path d="M58 42 C56.5 45 54 45 54 47.5 C54 49 55.8 49 58 49 C60.2 49 62 49 62 47.5 C62 45 59.5 45 58 42 Z" fill="#FFB03A" />
            <path d="M57.5 46 L58.5 46 L59 51 L57 51 Z" fill="#FFB03A" />
          </g>

          {/* Sparkles */}
          <path d="M82 25 L83 28 L86 29 L83 30 L82 33 L81 30 L78 29 L81 28 Z" fill="#FFB03A" />
          <path d="M20 64 L20.5 66 L22 66.5 L20.5 67 L20 69 L19.5 67 L18 66.5 L19.5 66 Z" fill="#FFB03A" opacity="0.7" />

          <defs>
            <radialGradient id="flip7-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFB03A" />
              <stop offset="100%" stopColor="#14110F" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 'uno':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Background glow */}
          <circle cx="50" cy="50" r="45" fill="url(#uno-glow)" opacity="0.35" />

          {/* Tilted UNO card */}
          <g transform="rotate(-12 50 50)">
            {/* Outer black card border for shadow */}
            <rect x="33" y="22" width="34" height="52" rx="6" fill="#0A0202" />
            {/* Red Card body */}
            <rect x="34" y="23" width="32" height="50" rx="5" fill="#D32F2F" stroke="#FF8A80" strokeWidth="1.5" />
            
            {/* Inner dark red panel */}
            <rect x="38" y="27" width="24" height="42" rx="3" fill="#900C0F" />
            
            {/* White oval slanted */}
            <ellipse cx="50" cy="48" rx="12" ry="7" fill="#FFFFFF" transform="rotate(-25 50 48)" />
            
            {/* UNO text slanted */}
            <text x="39" y="52" fill="#D32F2F" fontSize="10" fontFamily="Impact, system-ui, sans-serif" fontWeight="900" fontStyle="italic" transform="rotate(-25 50 48) scale(1.15, 0.9)">UNO</text>
          </g>

          {/* Speed lines around */}
          <path d="M22 35 L17 37" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
          <path d="M20 45 L15 45" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M80 60 L85 58" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
          <path d="M78 50 L83 50" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" />

          <defs>
            <radialGradient id="uno-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D32F2F" />
              <stop offset="100%" stopColor="#0A0202" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 'uno_flip':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Background glow */}
          <circle cx="50" cy="50" r="45" fill="url(#unoflip-glow)" opacity="0.35" />

          {/* Rotating arrows */}
          <path d="M28 40 C28 25 45 20 58 24" stroke="#7C4DFF" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M54 19 L60 25 L54 29" fill="#7C4DFF" />
          
          <path d="M72 60 C72 75 55 80 42 76" stroke="#7C4DFF" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M46 81 L40 75 L46 71" fill="#7C4DFF" />

          {/* Card 1 (Bottom Left, purple-violet) */}
          <g transform="rotate(-25 38 58)">
            <rect x="24" y="34" width="26" height="42" rx="4" fill="#2E1C4E" stroke="#7C4DFF" strokeWidth="1.5" />
            <ellipse cx="37" cy="55" rx="7" ry="4" fill="#5E35B1" transform="rotate(-30 37 55)" />
          </g>

          {/* Card 2 (Top Right, neon purple) */}
          <g transform="rotate(15 62 42)">
            <rect x="50" y="20" width="26" height="42" rx="4" fill="#3F2B6B" stroke="#B388FF" strokeWidth="2" />
            <ellipse cx="63" cy="41" rx="7" ry="4" fill="#7C4DFF" transform="rotate(-30 63 41)" />
          </g>

          <defs>
            <radialGradient id="unoflip-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#7C4DFF" />
              <stop offset="100%" stopColor="#120A24" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 'uno_no_mercy':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Background glow */}
          <circle cx="50" cy="50" r="45" fill="url(#unonomercy-glow)" opacity="0.35" />

          {/* Card 1 (Left Back) */}
          <g transform="rotate(-20 35 55)">
            <rect x="22" y="30" width="26" height="40" rx="3" fill="#110505" stroke="#421010" strokeWidth="1.5" />
            <text x="25" y="40" fill="#421010" fontSize="8" fontFamily="system-ui, sans-serif" fontWeight="900">A</text>
            <path d="M35 50 C33 50 32 52 32 54 C32 56 35 56 35 54 Z" fill="#421010" />
          </g>

          {/* Card 2 (Right Back) */}
          <g transform="rotate(20 65 55)">
            <rect x="52" y="30" width="26" height="40" rx="3" fill="#1A0808" stroke="#D32F2F" strokeWidth="1.5" />
            <text x="55" y="40" fill="#D32F2F" fontSize="8" fontFamily="system-ui, sans-serif" fontWeight="900">9</text>
            <path d="M65 50 C63 50 62 52 62 54 C62 56 65 56 65 54 Z" fill="#D32F2F" />
          </g>

          {/* Central Skull */}
          <g transform="translate(0, -2)">
            {/* Skull head */}
            <path d="M35 48 C35 38 41 34 50 34 C59 34 65 38 65 48 C65 54 62 56 61 59 C60 61 59 63 59 65 L41 65 C41 63 40 61 39 59 C38 56 35 54 35 48 Z" fill="#ECEFF1" stroke="#37474F" strokeWidth="2" />
            
            {/* Jaw */}
            <path d="M42 65 L44 71 L56 71 L58 65 Z" fill="#ECEFF1" stroke="#37474F" strokeWidth="2" />
            {/* Teeth lines */}
            <line x1="46" y1="65" x2="46" y2="70" stroke="#37474F" strokeWidth="1.5" />
            <line x1="50" y1="65" x2="50" y2="71" stroke="#37474F" strokeWidth="1.5" />
            <line x1="54" y1="65" x2="54" y2="70" stroke="#37474F" strokeWidth="1.5" />

            {/* Eyes */}
            <ellipse cx="44" cy="48" rx="4.5" ry="5.5" fill="#1A0808" />
            <ellipse cx="56" cy="48" rx="4.5" ry="5.5" fill="#1A0808" />
            
            {/* Nose */}
            <path d="M49 53 L51 53 L50 56 Z" fill="#1A0808" stroke="#1A0808" strokeWidth="1" strokeLinejoin="round" />
          </g>

          {/* Crimson spikes/slashes */}
          <path d="M22 28 L17 24" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
          <path d="M78 28 L83 24" stroke="#D32F2F" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 58 L13 60" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M82 58 L87 60" stroke="#D32F2F" strokeWidth="1.5" strokeLinecap="round" />

          <defs>
            <radialGradient id="unonomercy-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#D32F2F" />
              <stop offset="100%" stopColor="#110505" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 'catan':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Background glow */}
          <circle cx="50" cy="50" r="45" fill="url(#catan-glow)" opacity="0.35" />

          {/* Mountains in background */}
          <path d="M35 48 L50 32 L65 48 Z" fill="#2E2315" stroke="#D87D0D" strokeWidth="1" />
          <path d="M50 48 L62 35 L75 48 Z" fill="#211910" stroke="#D87D0D" strokeWidth="1" />

          {/* Center Cottage/House */}
          <rect x="44" y="52" width="14" height="12" fill="#E67E22" stroke="#4D2600" strokeWidth="1.5" />
          <polygon points="41,52 51,42 61,52" fill="#D35400" stroke="#4D2600" strokeWidth="1.5" />
          <rect x="49" y="57" width="4" height="7" fill="#4D2600" />

          {/* Wheat stalks (Left) */}
          <g transform="translate(18, 48)">
            <path d="M10 20 Q10 0 5 -5" stroke="#F1C40F" strokeWidth="1.5" fill="none" />
            <circle cx="5" cy="-2" r="2" fill="#F1C40F" />
            <circle cx="9" cy="2" r="2" fill="#F1C40F" />
            <circle cx="5" cy="5" r="2" fill="#F1C40F" />
            <circle cx="10" cy="9" r="2" fill="#F1C40F" />
            <circle cx="5" cy="12" r="2" fill="#F1C40F" />
          </g>

          {/* Wood logs stacked (Right) */}
          <g transform="translate(62, 54)">
            {/* Log 1 (Bottom Left) */}
            <rect x="2" y="6" width="14" height="6" rx="2" fill="#874C16" stroke="#4D2600" strokeWidth="1" />
            <circle cx="2" cy="9" r="3" fill="#D87D0D" stroke="#4D2600" strokeWidth="1" />
            
            {/* Log 2 (Bottom Right) */}
            <rect x="10" y="8" width="14" height="6" rx="2" fill="#874C16" stroke="#4D2600" strokeWidth="1" transform="rotate(5 10 8)" />
            
            {/* Log 3 (Top) */}
            <rect x="6" y="1" width="14" height="6" rx="2" fill="#874C16" stroke="#4D2600" strokeWidth="1" />
            <circle cx="6" cy="4" r="3" fill="#D87D0D" stroke="#4D2600" strokeWidth="1" />
          </g>

          <defs>
            <radialGradient id="catan-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#F1C40F" />
              <stop offset="100%" stopColor="#211910" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      );
    case 'general':
      return (
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          {/* Background glow */}
          <circle cx="50" cy="50" r="45" fill="url(#general-glow)" opacity="0.35" />

          {/* Clipboard (Background) */}
          <g transform="translate(24, 18)">
            {/* Board */}
            <rect x="4" y="8" width="34" height="46" rx="4" fill="#0D3B2E" stroke="#10B981" strokeWidth="1.5" />
            
            {/* Clip */}
            <path d="M16 4 H26 C28 4 28 8 28 8 H14 C14 8 14 4 16 4 Z" fill="#10B981" />
            <circle cx="21" cy="6" r="1.5" fill="#0D3B2E" />

            {/* Checklist Lines */}
            <rect x="10" y="18" width="22" height="2" rx="1" fill="#10B981" opacity="0.6" />
            <rect x="10" y="24" width="16" height="2" rx="1" fill="#10B981" opacity="0.6" />
            
            {/* Checkmarks */}
            <path d="M10 34 L12 36 L16 32" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="19" y="33" width="13" height="2" rx="1" fill="#10B981" opacity="0.8" />

            <path d="M10 44 L12 46 L16 42" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="19" y="43" width="10" height="2" rx="1" fill="#10B981" opacity="0.8" />
          </g>

          {/* 3D Dice (Front Right) */}
          <g transform="translate(56, 52)">
            {/* Shadow */}
            <ellipse cx="14" cy="24" rx="14" ry="4" fill="#000000" opacity="0.4" />

            {/* Isometric Dice Front-Right Face */}
            <path d="M14 6 L26 12 L26 24 L14 18 Z" fill="#065F46" stroke="#10B981" strokeWidth="1" />
            {/* Isometric Dice Front-Left Face */}
            <path d="M14 6 L2 12 L2 24 L14 18 Z" fill="#047857" stroke="#10B981" strokeWidth="1" />
            {/* Isometric Dice Top Face */}
            <path d="M14 6 L26 12 L14 18 L2 12 Z" fill="#34D399" stroke="#10B981" strokeWidth="1" />

            {/* Pips Top Face */}
            <circle cx="14" cy="12" r="1.5" fill="#047857" />

            {/* Pips Left Face */}
            <circle cx="8" cy="15" r="1.5" fill="#34D399" />
            <circle cx="20" cy="15" r="1.5" fill="#34D399" />
            <circle cx="8" cy="21" r="1.5" fill="#34D399" />
            <circle cx="20" cy="21" r="1.5" fill="#34D399" />

            {/* Pips Right Face */}
            <circle cx="20" cy="15" r="1" fill="#047857" opacity="0.7" />
            <circle cx="20" cy="21" r="1" fill="#047857" opacity="0.7" />
          </g>

          <defs>
            <radialGradient id="general-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#0D3B2E" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      );
    default:
      return null;
  }
};

const GAMES: GameConfig[] = [
  {
    id: 'flip7',
    name: 'FLIP7',
    tagline: 'Soma tática ou dobra de cartas',
    description: 'Alcance a maior pontuação sem estourar tirando cartas consecutivas no limite.',
    colorClass: 'from-amber-500/10 to-orange-600/10 border-orange-500/30 hover:border-orange-500/80 text-orange-400',
    badge: 'F7',
    defaultTarget: 100,
    defaultMaxRounds: 7,
    imageUrl: 'https://picsum.photos/seed/flip7cards/200/200',
  },
  {
    id: 'uno',
    name: 'UNO',
    tagline: 'O clássico de descarte',
    description: 'Livre-se de todas as suas cartas e some pontos com as cartas restantes dos oponentes.',
    colorClass: 'from-red-500/10 to-rose-600/10 border-red-500/30 hover:border-red-500/80 text-red-400',
    badge: 'UNO',
    defaultTarget: 500,
    defaultMaxRounds: 10,
    imageUrl: 'https://picsum.photos/seed/unocards/200/200',
  },
  {
    id: 'uno_flip',
    name: 'UNO FLIP',
    tagline: 'O jogo virou de verdade',
    description: 'Inverta o baralho com cartas de dupla face e regras muito mais severas e divertidas.',
    colorClass: 'from-indigo-500/10 to-purple-600/10 border-indigo-500/30 hover:border-indigo-500/80 text-indigo-400',
    badge: 'FLIP',
    defaultTarget: 500,
    defaultMaxRounds: 10,
    imageUrl: 'https://picsum.photos/seed/unoflip/200/200',
  },
  {
    id: 'uno_no_mercy',
    name: 'UNO NO MERCY',
    tagline: 'Sem piedade e competitivo extremo',
    description: 'Cartas com penalidades absurdas como +10 e regras de descarte impiedosas para amizades à prova.',
    colorClass: 'from-zinc-800/20 to-red-950/10 border-red-700/30 hover:border-red-600 text-red-500',
    badge: 'NO MERCY',
    defaultTarget: 1000,
    defaultMaxRounds: 15,
    imageUrl: 'https://picsum.photos/seed/unonomercy/200/200',
  },
  {
    id: 'catan',
    name: 'CATAN',
    tagline: 'Construção, troca e estratégia',
    description: 'Negocie matérias-primas, construa estradas e aldeias para alcançar os 10 pontos de vitória.',
    colorClass: 'from-yellow-700/10 to-amber-600/10 border-yellow-600/30 hover:border-yellow-500/80 text-yellow-500',
    badge: 'CATAN',
    defaultTarget: 10,
    defaultMaxRounds: 1,
    imageUrl: 'https://picsum.photos/seed/catanboard/200/200',
  },
  {
    id: 'general',
    name: 'GENERAL',
    tagline: 'Combinações de dados táticas',
    description: 'Marque pontos através de jogadas clássicas com 5 dados, desde sequência até o General.',
    colorClass: 'from-emerald-500/10 to-teal-600/10 border-emerald-500/30 hover:border-emerald-500/80 text-emerald-400',
    badge: 'DADOS',
    defaultTarget: 350,
    defaultMaxRounds: 13,
    imageUrl: 'https://picsum.photos/seed/dicerolling/200/200',
  }
];

const INITIAL_MATCHES: MatchHistory[] = [
  {
    id: 'm1',
    tableName: 'Mesa #42',
    date: '12 Jan, 2024',
    winnerName: 'Sora',
    winnerScore: 210,
    playersCount: 4,
    type: 'Epic',
  },
  {
    id: 'm2',
    tableName: 'Mesa de Treino',
    date: '11 Jan, 2024',
    winnerName: 'Leo',
    winnerScore: 198,
    playersCount: 3,
    type: 'Normal',
  },
  {
    id: 'm3',
    tableName: 'Mesa Amadora',
    date: '08 Jan, 2024',
    winnerName: 'Diana Z.',
    winnerScore: 160,
    playersCount: 5,
    type: 'FLIP7',
  }
];

const INITIAL_SIMULATED_TABLES: SimulatedTable[] = [
  {
    id: 'st1',
    name: 'Mesa dos Amigos',
    round: 12,
    players: [
      { name: 'Carlos', score: 88 },
      { name: 'Dani', score: 92 }
    ]
  },
  {
    id: 'st2',
    name: 'Flip7 Master Club',
    round: 3,
    players: [
      { name: 'Boss', score: 45 },
      { name: 'Rookie', score: 12 }
    ]
  },
  {
    id: 'st3',
    name: 'Treino Rápido',
    round: 15,
    players: [
      { name: 'Bot 1', score: 144 },
      { name: 'Você', score: 156 }
    ]
  }
];

// Fallback dynamic active table
const DEFAULT_ACTIVE_TABLE: Table = {
  id: 'torneio-sexta',
  name: 'Torneio de Sexta',
  targetScore: 150,
  maxRounds: 7,
  currentRound: 3,
  status: 'active',
  activePlayerIndex: 0,
  createdAt: new Date().toISOString(),
  gameTimeSeconds: 895, // 14:55
  players: [
    {
      id: 'sora',
      name: 'Sora',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6pa0w5xpTZvrK_3uvM1dVoxkye3hsEeSPbHjKscHfobDyn_1OPGmpPEpFuqLlB1cupPScEFS6Klv4UvmsJ1gksOkuPot9sgnCqIWZvpnONcvV3pR2z1QDu6c3jWxb4Wbu0Iet1DMhuXVvuNEpg2XHsQoW_vTEImQyOlhqfpOn-w70yfNBOmNe0iLweBemHQC4jfL6k2hz9VmumeZLYBnjOfEO6tv8s6yNrSOs_NOiDqtw7R7rjDehSw',
      score: 12, // currently has +12 round points
      isBusted: false,
      history: [60, 70],
      totalScore: 142, // 130 previous banked + 12 current round points
    },
    {
      id: 'leo',
      name: 'Leo',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALr3M0R7WX9w0I18Zt_lPiE7GpggmvfxQ4kDxLM09MMVQebI_bnLDzBzoRcb7kymV5P8DcZ5S4spm3JetUQg9zDbueAwDSuSG8ww-SMZK2GltDWwt4kQqx-ipU0GGd4FrXnGklXKgOSQn9c8qj4Kwu8tEdVrLCcIxsnA3lfT4GKDnCSa3OB-7e5fUhCLwPGQ_hBQ4C6wouoVzRmQuy_8ALQ_FThrOqROIeLqQE2L72qsfidyGfTCr2FQ',
      score: 0,
      isBusted: false,
      history: [58, 60],
      totalScore: 118,
    },
    {
      id: 'maya',
      name: 'Mei',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB8m_2_6IIJy1TTbhHrcHIUeG00aHs0g_HLzESHhHL3ei1am90AypSYcj3ToPlur5WtCNNffsj1bUJcDabDqUfSYBX8uJkkv_-hIiW5Dy0wMLJit3_1kb-ofO-r7ojEDuAxYLdACV_MFU-gIKktcGLdNnzTAiYlYM26MkzVskBt2-CAAirQnRHTb_mrTA3mn8Obs6jWFMa8DowHoynCNwrefXLVTsvBQINNh_G0zZ-_vNQ4rauhsUUp7w',
      score: 0,
      isBusted: true, // busted in round 3
      history: [50, 60],
      totalScore: 110,
    },
    {
      id: 'alex',
      name: 'Jax',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCaZ4tNKiAoYP0kwHUknsEVv98mctmG36cLK2fuDll4zckwqTl0dMrBrzoY_-tjG9Vjc7sPNcSS8J7wsgjTPf3yi5ONBkC8Pe43JDdIW5RUkNiTDmrGm49KnJviA4gINsn5xLaMlTpIP0KXYbq2OEdWMZPlKkfvgrIm72fngAqWQCCMpCgSeNG-G5uleX126_Yg_8IyFxdIAT4Tqdl7r--PhtcTF6nKVis-XT-qQgeE1jgGMgGpLg5XAg',
      score: 0,
      isBusted: false,
      history: [44, 50],
      totalScore: 94,
    }
  ]
};

export default function Home() {
  // Navigation states: 'dashboard' | 'players' | 'new_game' | 'live'
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Selected Game states: 'flip7' | 'uno' | 'uno_flip' | 'uno_no_mercy' | 'catan' | 'general' | null
  const [selectedGame, setSelectedGame] = useState<string | null>(null);

  // Custom live score points input
  const [customPoints, setCustomPoints] = useState<string>('');

  // Hydration safety flag
  const [isHydrated, setIsHydrated] = useState<boolean>(false);

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string } | null>(null);
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');
  const [isRegisterMode, setIsRegisterMode] = useState<boolean>(false);
  const [registerName, setRegisterName] = useState<string>('');
  const [registerEmail, setRegisterEmail] = useState<string>('');
  const [registerPassword, setRegisterPassword] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  // Core Entity States
  const [players, setPlayers] = useState<Player[]>([]);
  const [history, setHistory] = useState<MatchHistory[]>([]);
  const [activeTable, setActiveTable] = useState<Table | null>(null);
  const [dbHistory, setDbHistory] = useState<DBMatchHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

  // App settings and preferences
  const [prefSound, setPrefSound] = useState<boolean>(true);
  const [prefQuickScore, setPrefQuickScore] = useState<boolean>(false);
  const [prefStrictRules, setPrefStrictRules] = useState<boolean>(false);
  const [isClearingHistory, setIsClearingHistory] = useState<boolean>(false);
  const [settingsMessage, setSettingsMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


  // New Game settings
  const [newTableName, setNewTableName] = useState<string>('');
  const [newTargetScore, setNewTargetScore] = useState<number>(100);
  const [newMaxRounds, setNewMaxRounds] = useState<number>(7);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);

  // Add Player Modal states
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState<boolean>(false);
  const [addPlayerName, setAddPlayerName] = useState<string>('');
  const [addPlayerStyle, setAddPlayerStyle] = useState<'Agressivo' | 'Agressiva' | 'Conservador' | 'Equilibrado' | 'Coringa'>('Equilibrado');
  const [addPlayerAvatar, setAddPlayerAvatar] = useState<string>('');
  const [addPlayerWins, setAddPlayerWins] = useState<number>(0);
  const [addPlayerAverage, setAddPlayerAverage] = useState<number>(0);

  // Edit Player Modal states
  const [isEditPlayerModalOpen, setIsEditPlayerModalOpen] = useState<boolean>(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [editPlayerName, setEditPlayerName] = useState<string>('');
  const [editPlayerStyle, setEditPlayerStyle] = useState<'Agressivo' | 'Agressiva' | 'Conservador' | 'Equilibrado' | 'Coringa'>('Equilibrado');
  const [editPlayerAvatar, setEditPlayerAvatar] = useState<string>('');
  const [editPlayerWins, setEditPlayerWins] = useState<number>(0);
  const [editPlayerAverage, setEditPlayerAverage] = useState<number>(0);

  // Live scoring accumulated round scores state
  const [currentRoundLogs, setCurrentRoundLogs] = useState<{ playerName: string; message: string; points: number; isBusted: boolean; isFlip7: boolean }[]>([]);

  // Timer Ref for live game
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load from local storage and API
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Fetch players from database API
      fetch('/api/players')
        .then((res) => res.json())
        .then((dbPlayers) => {
          if (Array.isArray(dbPlayers) && dbPlayers.length > 0) {
            setPlayers(dbPlayers);
            localStorage.setItem('flip7_players', JSON.stringify(dbPlayers));
          }
        })
        .catch((err) => console.error("Error loading players from database:", err));

      const storedPlayers = localStorage.getItem('flip7_players');
      const storedHistory = localStorage.getItem('flip7_history');
      const storedActiveTable = localStorage.getItem('flip7_active_table');
      const storedUser = localStorage.getItem('flip7_logged_in_user');
      const storedGame = localStorage.getItem('flip7_selected_game');
      const storedSound = localStorage.getItem('flip7_pref_sound');
      const storedQuickScore = localStorage.getItem('flip7_pref_quick_score');
      const storedStrictRules = localStorage.getItem('flip7_pref_strict_rules');

      const parsedPlayers = storedPlayers ? JSON.parse(storedPlayers) : INITIAL_PLAYERS;
      const parsedHistory = storedHistory ? JSON.parse(storedHistory) : INITIAL_MATCHES;
      const parsedActiveTable = storedActiveTable ? JSON.parse(storedActiveTable) : DEFAULT_ACTIVE_TABLE;
      let parsedUser = storedUser ? JSON.parse(storedUser) : null;

      // Automatically migrate stored "Game Master" session to "On Idéias Criativas"
      if (parsedUser && parsedUser.name === 'Game Master') {
        parsedUser.name = 'On Idéias Criativas';
        localStorage.setItem('flip7_logged_in_user', JSON.stringify(parsedUser));
      }

      // Initialize seed users if not existing
      const storedUsers = localStorage.getItem('flip7_users');
      if (!storedUsers) {
        localStorage.setItem(
          'flip7_users',
          JSON.stringify([{ name: 'On Idéias Criativas', email: 'admin@flip7.com', password: 'senha123' }])
        );
      } else {
        // Also migrate existing user list in localStorage if "Game Master" is present
        try {
          const parsedUsers = JSON.parse(storedUsers);
          let migrated = false;
          const updatedUsers = parsedUsers.map((u: any) => {
            if (u.name === 'Game Master') {
              u.name = 'On Idéias Criativas';
              migrated = true;
            }
            return u;
          });
          if (migrated) {
            localStorage.setItem('flip7_users', JSON.stringify(updatedUsers));
          }
        } catch (e) {
          console.error(e);
        }
      }

      // Supabase listener
      let unsubscribeAuth: (() => void) | null = null;
      if (supabase) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session && session.user) {
            const userSession = {
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Jogador'
            };
            setCurrentUser(userSession);
            setIsLoggedIn(true);
            localStorage.setItem('flip7_logged_in_user', JSON.stringify(userSession));
          }
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (session && session.user) {
            const userSession = {
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'Jogador'
            };
            setCurrentUser(userSession);
            setIsLoggedIn(true);
            localStorage.setItem('flip7_logged_in_user', JSON.stringify(userSession));
          } else {
            setCurrentUser(null);
            setIsLoggedIn(false);
            localStorage.removeItem('flip7_logged_in_user');
          }
        });
        unsubscribeAuth = subscription.unsubscribe;
      }

      setTimeout(() => {
        setPlayers(parsedPlayers);
        setHistory(parsedHistory);
        setActiveTable(parsedActiveTable);
        if (storedGame) {
          setSelectedGame(storedGame);
        }
        if (storedSound !== null) {
          setPrefSound(storedSound === 'true');
        }
        if (storedQuickScore !== null) {
          setPrefQuickScore(storedQuickScore === 'true');
        }
        if (storedStrictRules !== null) {
          setPrefStrictRules(storedStrictRules === 'true');
        }
        if (!supabase && parsedUser) {
          setCurrentUser(parsedUser);
          setIsLoggedIn(true);
        }
        // Pre-select 4 players by default for New Game
        setSelectedPlayerIds(['sora', 'leo', 'maya', 'alex']);
        setIsHydrated(true);
      }, 0);

      return () => {
        if (unsubscribeAuth) unsubscribeAuth();
      };
    }
  }, []);

  const fetchDbHistory = () => {
    setTimeout(() => {
      setIsLoadingHistory(true);
    }, 0);
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDbHistory(data);
        }
      })
      .catch((err) => console.error("Error fetching db history:", err))
      .finally(() => {
        setIsLoadingHistory(false);
      });
  };

  const handleClearDbHistory = async () => {
    if (!confirm("Aviso: Tem certeza de que deseja limpar todo o histórico de jogadas do banco de dados? Esta ação é irreversível.")) {
      return;
    }
    
    setIsClearingHistory(true);
    setSettingsMessage(null);
    
    try {
      const response = await fetch('/api/history', {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (response.ok && data.success) {
        setDbHistory([]);
        setHistory([]);
        localStorage.setItem('flip7_history', JSON.stringify([]));
        setSettingsMessage({ type: 'success', text: 'Histórico de partidas do banco de dados limpo com sucesso!' });
      } else {
        setSettingsMessage({ type: 'error', text: data.error || 'Erro ao limpar histórico do banco de dados.' });
      }
    } catch (err) {
      console.error("Error clearing history:", err);
      setSettingsMessage({ type: 'error', text: 'Erro de rede ou conexão ao limpar o histórico.' });
    } finally {
      setIsClearingHistory(false);
      // clear message after 5 seconds
      setTimeout(() => {
        setSettingsMessage(null);
      }, 5000);
    }
  };


  // Dynamically fetch up-to-date players and history from database when changing tabs
  useEffect(() => {
    if (isHydrated) {
      fetch('/api/players')
        .then((res) => res.json())
        .then((dbPlayers) => {
          if (Array.isArray(dbPlayers) && dbPlayers.length > 0) {
            setPlayers(dbPlayers);
            localStorage.setItem('flip7_players', JSON.stringify(dbPlayers));
          }
        })
        .catch((err) => console.error("Error refreshing players from database:", err));

      fetchDbHistory();
    }
  }, [activeTab, isHydrated]);


  // Save changes to local storage helper
  const savePlayersToLocalStorage = (updatedPlayers: Player[]) => {
    setPlayers(updatedPlayers);
    localStorage.setItem('flip7_players', JSON.stringify(updatedPlayers));
  };

  const saveHistoryToLocalStorage = (updatedHistory: MatchHistory[]) => {
    setHistory(updatedHistory);
    localStorage.setItem('flip7_history', JSON.stringify(updatedHistory));
  };

  const saveActiveTableToLocalStorage = (updatedTable: Table | null) => {
    setActiveTable(updatedTable);
    if (updatedTable) {
      localStorage.setItem('flip7_active_table', JSON.stringify(updatedTable));
    } else {
      localStorage.removeItem('flip7_active_table');
    }
  };

  const handleSelectGame = (gameId: string | null) => {
    setSelectedGame(gameId);
    if (gameId) {
      localStorage.setItem('flip7_selected_game', gameId);
      const gameConfig = GAMES.find((g) => g.id === gameId);
      if (gameConfig) {
        setNewTargetScore(gameConfig.defaultTarget);
        setNewMaxRounds(gameConfig.defaultMaxRounds);
        setNewTableName(`Torneio de ${gameConfig.name}`);
      }
    } else {
      localStorage.removeItem('flip7_selected_game');
    }
  };

  const handleAddCustomPoints = () => {
    const pts = parseInt(customPoints);
    if (!isNaN(pts) && pts !== 0) {
      handleAddLivePoints(pts);
      setCustomPoints('');
    }
  };

  // Game timer ticking
  useEffect(() => {
    if (activeTable && activeTable.status === 'active' && activeTab === 'live') {
      timerRef.current = setInterval(() => {
        setActiveTable((prevTable) => {
          if (!prevTable) return null;
          const updated = {
            ...prevTable,
            gameTimeSeconds: prevTable.gameTimeSeconds + 1,
          };
          localStorage.setItem('flip7_active_table', JSON.stringify(updated));
          return updated;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTable?.id, activeTable?.status, activeTab]);

  if (!isHydrated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-on-background">
        <div className="w-12 h-12 border-4 border-primary-container border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-display text-xl text-primary-container tracking-wider uppercase animate-pulse">FLIP7 Placar</p>
      </div>
    );
  }

  // --- ACTIONS ---

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAuthError('Por favor, preencha todos os campos.');
      return;
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginEmail.trim(),
          password: loginPassword.trim(),
        });

        if (error) {
          setAuthError('Erro ao fazer login: ' + error.message);
          return;
        }

        if (data && data.user) {
          const userSession = {
            email: data.user.email || '',
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Jogador'
          };
          localStorage.setItem('flip7_logged_in_user', JSON.stringify(userSession));
          setCurrentUser(userSession);
          setIsLoggedIn(true);
          setLoginEmail('');
          setLoginPassword('');
        }
      } catch (err: any) {
        setAuthError('Ocorreu um erro ao conectar com o Supabase.');
        console.error(err);
      }
    } else {
      const storedUsersStr = localStorage.getItem('flip7_users');
      const usersList = storedUsersStr ? JSON.parse(storedUsersStr) : [{ name: 'On Idéias Criativas', email: 'admin@flip7.com', password: 'senha123' }];

      const matchedUser = usersList.find(
        (u: any) => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.password === loginPassword.trim()
      );

      if (matchedUser) {
        const userSession = { email: matchedUser.email, name: matchedUser.name };
        localStorage.setItem('flip7_logged_in_user', JSON.stringify(userSession));
        setCurrentUser(userSession);
        setIsLoggedIn(true);
        setLoginEmail('');
        setLoginPassword('');
      } else {
        setAuthError('E-mail ou senha incorretos. Tente admin@flip7.com / senha123');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (!registerName.trim() || !registerEmail.trim() || !registerPassword.trim()) {
      setAuthError('Preencha todos os campos para se cadastrar.');
      return;
    }

    if (supabase) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: registerEmail.trim(),
          password: registerPassword.trim(),
          options: {
            data: {
              name: registerName.trim(),
            },
          },
        });

        if (error) {
          setAuthError('Erro ao se cadastrar: ' + error.message);
          return;
        }

        if (data && data.user) {
          const userSession = {
            email: data.user.email || '',
            name: data.user.user_metadata?.name || registerName.trim()
          };
          localStorage.setItem('flip7_logged_in_user', JSON.stringify(userSession));
          setCurrentUser(userSession);
          setIsLoggedIn(true);

          // Reset inputs
          setRegisterName('');
          setRegisterEmail('');
          setRegisterPassword('');
          setIsRegisterMode(false);
        }
      } catch (err: any) {
        setAuthError('Ocorreu um erro ao conectar com o Supabase.');
        console.error(err);
      }
    } else {
      const storedUsersStr = localStorage.getItem('flip7_users');
      const usersList = storedUsersStr ? JSON.parse(storedUsersStr) : [{ name: 'On Idéias Criativas', email: 'admin@flip7.com', password: 'senha123' }];

      const emailExists = usersList.some((u: any) => u.email.toLowerCase() === registerEmail.trim().toLowerCase());
      if (emailExists) {
        setAuthError('Este e-mail já está cadastrado.');
        return;
      }

      const newUser = {
        name: registerName.trim(),
        email: registerEmail.trim().toLowerCase(),
        password: registerPassword.trim(),
      };

      const updatedUsers = [...usersList, newUser];
      localStorage.setItem('flip7_users', JSON.stringify(updatedUsers));

      // Auto-login
      const userSession = { email: newUser.email, name: newUser.name };
      localStorage.setItem('flip7_logged_in_user', JSON.stringify(userSession));
      setCurrentUser(userSession);
      setIsLoggedIn(true);

      // Reset inputs
      setRegisterName('');
      setRegisterEmail('');
      setRegisterPassword('');
      setIsRegisterMode(false);
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error("Error signing out from Supabase:", err);
      }
    }
    localStorage.removeItem('flip7_logged_in_user');
    setCurrentUser(null);
    setIsLoggedIn(false);
  };

  // Add new Custom Player
  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addPlayerName.trim()) return;

    // Pick avatar (use selected preset, or a random preset if none selected)
    const finalAvatar = addPlayerAvatar || PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)];

    const newPlayer: Player = {
      id: 'custom_' + Date.now(),
      name: addPlayerName,
      style: addPlayerStyle,
      avatar: finalAvatar,
      totalWins: addPlayerWins,
      averageScore: addPlayerAverage,
      lastPlayed: 'Hoje',
      isCustom: true,
    };

    // Save locally first for robust instant updates
    const localPlayers = [newPlayer, ...players.filter(p => p.id !== newPlayer.id)];
    savePlayersToLocalStorage(localPlayers);
    setSelectedPlayerIds((prev) => [newPlayer.id, ...prev]);

    // Background sync with database API
    fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newPlayer),
    })
      .then((res) => res.json())
      .then((savedPlayer) => {
        if (savedPlayer && !savedPlayer.error) {
          const updatedPlayers = [savedPlayer, ...players.filter(p => p.id !== savedPlayer.id && p.id !== newPlayer.id)];
          savePlayersToLocalStorage(updatedPlayers);
        }
      })
      .catch((err) => console.error("Error saving player to database:", err));

    // Reset inputs
    setAddPlayerName('');
    setAddPlayerStyle('Equilibrado');
    setAddPlayerAvatar('');
    setAddPlayerWins(0);
    setAddPlayerAverage(0);
    setIsAddPlayerModalOpen(false);
  };

  // Edit existing Player
  const handleEditPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlayerId || !editPlayerName.trim()) return;

    const updatedPlayer = {
      name: editPlayerName,
      style: editPlayerStyle,
      avatar: editPlayerAvatar || PRESET_AVATARS[0],
      totalWins: editPlayerWins,
      averageScore: editPlayerAverage,
    };

    // Update locally first for instant feedback
    const localPlayers = players.map((p) => (p.id === editingPlayerId ? { ...p, ...updatedPlayer } : p));
    savePlayersToLocalStorage(localPlayers);

    // Sync update to the database
    fetch(`/api/players/${editingPlayerId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPlayer),
    })
      .then((res) => res.json())
      .then((savedPlayer) => {
        if (savedPlayer && !savedPlayer.error) {
          const updatedPlayers = players.map((p) => (p.id === editingPlayerId ? savedPlayer : p));
          savePlayersToLocalStorage(updatedPlayers);
        }
      })
      .catch((err) => console.error("Error updating player in database:", err));

    setIsEditPlayerModalOpen(false);
    setEditingPlayerId(null);
  };

  // Toggle player selection for a new game
  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId]
    );
  };

  // Initialize and start a custom game table
  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlayerIds.length < 2) {
      alert('Selecione pelo menos 2 jogadores para iniciar o duelo!');
      return;
    }

    const tablePlayers = selectedPlayerIds.map((id) => {
      const p = players.find((item) => item.id === id) || INITIAL_PLAYERS[0];
      return {
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        score: 0,
        isBusted: false,
        history: [],
        totalScore: 0,
      };
    });

    const newTable: Table = {
      id: 'table_' + Date.now(),
      name: newTableName.trim() || 'Torneio de ' + new Date().toLocaleDateString('pt-BR', { weekday: 'long' }),
      targetScore: newTargetScore,
      maxRounds: newMaxRounds,
      currentRound: 1,
      status: 'active',
      players: tablePlayers,
      activePlayerIndex: 0,
      createdAt: new Date().toISOString(),
      gameTimeSeconds: 0,
      game: selectedGame || 'flip7',
    };

    saveActiveTableToLocalStorage(newTable);
    setCurrentRoundLogs([]);
    setActiveTab('live');
  };

  // Helper formatting for timer mm:ss
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Active Live Game Scoring Actions
  const handleAddLivePoints = (points: number) => {
    if (!activeTable) return;

    setActiveTable((prevTable) => {
      if (!prevTable) return null;
      const updated = { ...prevTable };
      const player = updated.players[updated.activePlayerIndex];

      if (player.isBusted) return prevTable;

      // Add to current round point accumulator
      player.score += points;
      // Also updates temporary visually total
      player.totalScore = (player.history.reduce((a, b) => a + b, 0)) + player.score;

      localStorage.setItem('flip7_active_table', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLiveBust = () => {
    if (!activeTable) return;
    const prevIndex = activeTable.activePlayerIndex;
    const player = activeTable.players[prevIndex];

    // Log the Bust
    const logMsg = {
      playerName: player.name,
      message: 'ESTOUROU!',
      points: 0,
      isBusted: true,
      isFlip7: false,
    };
    setCurrentRoundLogs((prev) => [logMsg, ...prev]);

    setActiveTable((prevTable) => {
      if (!prevTable) return null;
      const updated = { ...prevTable };
      const activePlayer = updated.players[prevIndex];

      activePlayer.isBusted = true;
      activePlayer.score = 0; // loses all points for this round
      activePlayer.totalScore = activePlayer.history.reduce((a, b) => a + b, 0); // reverts to last banked state

      // Move to next player
      advanceLiveTurn(updated);

      localStorage.setItem('flip7_active_table', JSON.stringify(updated));
      return updated;
    });
  };

  const handleLiveFlip7 = () => {
    if (!activeTable) return;
    const prevIndex = activeTable.activePlayerIndex;
    const player = activeTable.players[prevIndex];

    // FLIP7 scores: custom bonus score + banks turn immediately!
    const bonus = 21; // FLIP7 bonus points
    const logMsg = {
      playerName: player.name,
      message: 'FLIP7 Seq Bônus! (+21 pts)',
      points: bonus,
      isBusted: false,
      isFlip7: true,
    };
    setCurrentRoundLogs((prev) => [logMsg, ...prev]);

    setActiveTable((prevTable) => {
      if (!prevTable) return null;
      const updated = { ...prevTable };
      const activePlayer = updated.players[prevIndex];

      activePlayer.score += bonus;
      activePlayer.totalScore = (activePlayer.history.reduce((a, b) => a + b, 0)) + activePlayer.score;

      // Lock round immediately for player (Bank points)
      activePlayer.history.push(activePlayer.score);
      activePlayer.score = 0;

      // Check if target met after banking
      checkAndAdvanceTurn(updated);

      localStorage.setItem('flip7_active_table', JSON.stringify(updated));
      return updated;
    });
  };

  const handleBankLivePoints = () => {
    if (!activeTable) return;
    const prevIndex = activeTable.activePlayerIndex;
    const player = activeTable.players[prevIndex];

    const bankedPoints = player.score;

    const logMsg = {
      playerName: player.name,
      message: `Manteve ${bankedPoints} pts seguros.`,
      points: bankedPoints,
      isBusted: false,
      isFlip7: false,
    };
    setCurrentRoundLogs((prev) => [logMsg, ...prev]);

    setActiveTable((prevTable) => {
      if (!prevTable) return null;
      const updated = { ...prevTable };
      const activePlayer = updated.players[prevIndex];

      // Bank accumulated score
      activePlayer.history.push(activePlayer.score);
      activePlayer.score = 0;

      checkAndAdvanceTurn(updated);

      localStorage.setItem('flip7_active_table', JSON.stringify(updated));
      return updated;
    });
  };

  const checkAndAdvanceTurn = (updated: Table) => {
    // Check if player hit or exceeded the target score after banking
    const lastBankedScore = updated.players[updated.activePlayerIndex].totalScore;
    if (lastBankedScore >= updated.targetScore) {
      endActiveGame(updated, updated.players[updated.activePlayerIndex]);
    } else {
      advanceLiveTurn(updated);
    }
  };

  const advanceLiveTurn = (updated: Table) => {
    const nextIndex = updated.activePlayerIndex + 1;

    if (nextIndex >= updated.players.length) {
      // End of round! Increment round
      const nextRound = updated.currentRound + 1;

      // Reset round states (isBusted = false) for all active players
      updated.players.forEach((p) => {
        p.isBusted = false;
        p.score = 0;
      });

      if (nextRound > updated.maxRounds) {
        // Find winner by maximum total score
        const sortedPlayers = [...updated.players].sort((a, b) => b.totalScore - a.totalScore);
        const winner = sortedPlayers[0];
        endActiveGame(updated, winner);
      } else {
        updated.currentRound = nextRound;
        updated.activePlayerIndex = 0;
      }
    } else {
      updated.activePlayerIndex = nextIndex;
    }
  };

  const endActiveGame = (table: Table, winnerPlayer: typeof table.players[0]) => {
    table.status = 'completed';

    // Register Match History
    const matchHistoryItem: MatchHistory = {
      id: 'match_' + Date.now(),
      tableName: table.name,
      date: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }),
      winnerName: winnerPlayer.name,
      winnerScore: winnerPlayer.totalScore,
      playersCount: table.players.length,
      type: winnerPlayer.totalScore > 180 ? 'Epic' : winnerPlayer.totalScore > 140 ? 'FLIP7' : 'Normal',
      game: selectedGame || 'flip7',
    };

    saveHistoryToLocalStorage([matchHistoryItem, ...history]);

    // Create database history records for ALL players in the table
    const dbHistoryRecords = table.players.map((p, idx) => ({
      id: `hist_${Date.now()}_${idx}`,
      matchId: matchHistoryItem.id,
      date: matchHistoryItem.date,
      tableName: table.name,
      playerName: p.name,
      playerId: p.id,
      score: p.totalScore,
      isWinner: p.id === winnerPlayer.id,
      game: selectedGame || 'flip7'
    }));

    // Post to API
    fetch('/api/history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dbHistoryRecords),
    })
      .then((res) => res.json())
      .then(() => {
        fetchDbHistory();
      })
      .catch((err) => console.error("Error saving match history to database:", err));

    // Update Winner Player Win Counts & Averages
    const updatedPlayers = players.map((p) => {
      if (p.name.toLowerCase() === winnerPlayer.name.toLowerCase() || p.id === winnerPlayer.id) {
        return {
          ...p,
          totalWins: p.totalWins + 1,
          lastPlayed: 'Hoje',
          averageScore: Math.round((p.averageScore + winnerPlayer.totalScore) / 2),
        };
      }
      return p;
    });
    savePlayersToLocalStorage(updatedPlayers);
  };

  const handleResetActiveGame = () => {
    if (window.confirm('Tem certeza de que deseja reiniciar o jogo atual? Todo o progresso desta rodada será perdido.')) {
      if (activeTable) {
        const restartedPlayers = activeTable.players.map((p) => ({
          ...p,
          score: 0,
          isBusted: false,
          history: [],
          totalScore: 0,
        }));
        const restartedTable: Table = {
          ...activeTable,
          currentRound: 1,
          status: 'active',
          activePlayerIndex: 0,
          gameTimeSeconds: 0,
          players: restartedPlayers,
        };
        saveActiveTableToLocalStorage(restartedTable);
        setCurrentRoundLogs([]);
      }
    }
  };

  const handleClearFinishedGame = () => {
    saveActiveTableToLocalStorage(null);
    setActiveTab('dashboard');
  };

  // Quick Action: "Quick Add Score" trigger
  const handleQuickAddScore = () => {
    if (activeTable && activeTable.status === 'active' && (activeTable.game === selectedGame || (!activeTable.game && selectedGame === 'flip7'))) {
      setActiveTab('live');
    } else {
      const gameConfig = GAMES.find((g) => g.id === selectedGame);
      setNewTableName('Mesa Rápida de ' + (gameConfig ? gameConfig.name : 'FLIP7'));
      setNewTargetScore(gameConfig ? gameConfig.defaultTarget : 100);
      setNewMaxRounds(gameConfig ? gameConfig.defaultMaxRounds : 7);
      setActiveTab('new_game');
    }
  };

  // Find dynamic leader on active table
  const getLeader = () => {
    if (!activeTable) return null;
    return [...activeTable.players].sort((a, b) => b.totalScore - a.totalScore)[0];
  };

  const currentLeader = getLeader();

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen text-on-background bg-background font-sans flex items-center justify-center p-4 relative overflow-hidden">
        {/* Decorative Grid / Accent Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="w-full max-w-md bg-surface-container border-2 border-surface-variant rounded-3xl p-8 shadow-2xl relative z-10 animate-pop">
          {/* Brand Logo / Header */}
          <div className="text-center mb-8">
            <div className="mb-4 flex justify-center">
              <AppLogo className="w-28 h-28 hover:scale-105 transition-transform duration-300" />
            </div>
            <h1 className="font-display font-black text-3xl text-primary-container tracking-tighter uppercase">
              jogatina
            </h1>
            <p className="text-on-surface-variant text-sm mt-2 font-display">
              O painel definitivo de pontuação para FLIP7, UNO, CATAN, GENERAL e muito mais!
            </p>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-surface-variant mb-6">
            <button
              onClick={() => {
                setIsRegisterMode(false);
                setAuthError('');
              }}
              className={`flex-1 pb-3 text-sm font-mono tracking-wider uppercase text-center border-b-2 transition-all cursor-pointer ${
                !isRegisterMode
                  ? 'border-primary-container text-primary-container font-black'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface font-medium'
              }`}
            >
              Entrar
            </button>
            <button
              onClick={() => {
                setIsRegisterMode(true);
                setAuthError('');
              }}
              className={`flex-1 pb-3 text-sm font-mono tracking-wider uppercase text-center border-b-2 transition-all cursor-pointer ${
                isRegisterMode
                  ? 'border-primary-container text-primary-container font-black'
                  : 'border-transparent text-on-surface-variant hover:text-on-surface font-medium'
              }`}
            >
              Cadastrar
            </button>
          </div>

          {authError && (
            <div className="mb-5 p-4 bg-error-container/20 border border-error/30 rounded-xl text-error text-xs font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-error animate-pulse flex-shrink-0"></div>
              <span>{authError}</span>
            </div>
          )}

          {/* Form Content */}
          {!isRegisterMode ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                  E-mail do Jogador
                </label>
                <input
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ex: admin@flip7.com"
                  className="w-full bg-surface-container-high border border-surface-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Senha
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Sua senha secreta"
                  className="w-full bg-surface-container-high border border-surface-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary-container text-on-primary-container font-mono text-xs font-bold tracking-widest rounded-xl border-b-4 border-black active:translate-y-0.5 active:border-b-2 transition-all hover:brightness-110 cursor-pointer uppercase mt-6 font-black"
              >
                ACESSAR JOGATINA
              </button>


            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Nome Completo / Apelido
                </label>
                <input
                  type="text"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  placeholder="ex: João Silva"
                  className="w-full bg-surface-container-high border border-surface-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                  E-mail
                </label>
                <input
                  type="email"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  placeholder="ex: joao@gmail.com"
                  className="w-full bg-surface-container-high border border-surface-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5">
                  Senha de Acesso
                </label>
                <input
                  type="password"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full bg-surface-container-high border border-surface-variant rounded-xl px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-transparent transition-all"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-primary-container text-on-primary-container font-mono text-xs font-bold tracking-widest rounded-xl border-b-4 border-black active:translate-y-0.5 active:border-b-2 transition-all hover:brightness-110 cursor-pointer uppercase mt-6 font-black"
              >
                CRIAR MINHA CONTA
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (!selectedGame) {
    return (
      <div className="min-h-screen text-on-background bg-background font-sans flex flex-col p-6 md:p-12 relative overflow-hidden">
        {/* Decorative Grid / Accent Orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-secondary-container/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary-container/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="w-full max-w-5xl mx-auto flex justify-between items-center mb-10 relative z-10">
          <div className="flex items-center gap-3">
            <AppLogo className="w-14 h-14 hover:scale-105 transition-transform duration-300" />
            <div>
              <h1 className="font-display font-black text-2xl text-primary-container tracking-tighter uppercase leading-none">
                JOGATINA - PLACAR
              </h1>
              <p className="text-on-surface-variant text-xs font-display mt-1">
                Selecione o jogo ativo para iniciar ou acompanhar as mesas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-surface-container border border-surface-variant rounded-full text-xs font-mono font-bold text-on-surface-variant">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{currentUser?.name || 'Jogador'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 text-xs font-mono font-bold text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors px-3 py-2 rounded-xl cursor-pointer bg-surface-container border border-surface-variant"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Content - Cards Grid */}
        <div className="w-full max-w-5xl mx-auto relative z-10 flex-grow flex flex-col justify-center">
          <h2 className="font-display font-black text-3xl text-on-surface tracking-tight uppercase mb-8 text-center sm:text-left">
            Escolha o seu Jogo ⚔️
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GAMES.map((game) => {
              return (
                <div
                  key={game.id}
                  onClick={() => handleSelectGame(game.id)}
                  className={`bg-surface-container/60 hover:bg-surface-container border-2 rounded-3xl p-6 transition-all duration-300 group cursor-pointer flex flex-col justify-start h-[210px] hover:-translate-y-1.5 hover:shadow-xl relative overflow-hidden bg-gradient-to-br ${game.colorClass}`}
                >
                  {/* Decorative faint glow */}
                  <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/5 rounded-full group-hover:scale-125 transition-all duration-500 pointer-events-none"></div>
                  
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-background border border-surface-variant rounded-2xl shadow-md overflow-hidden relative group-hover:scale-110 group-hover:border-primary transition-all duration-300 flex items-center justify-center p-1 bg-gradient-to-br from-surface-bright to-surface">
                      <GameIllustration gameId={game.id} />
                    </div>
                  </div>

                  <h3 className="font-display font-black text-2xl tracking-tight mb-2 group-hover:text-primary-container transition-colors uppercase">
                    {game.name}
                  </h3>
                  
                  <p className="text-on-surface-variant/80 text-xs leading-relaxed line-clamp-3">
                    {game.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="w-full max-w-5xl mx-auto text-center mt-12 py-6 border-t border-surface-variant/20 relative z-10">
          <p className="text-on-surface-variant/60 font-mono text-[10px] uppercase tracking-widest">
            JOGATINA MULTI-JOGOS PLACAR © {new Date().getFullYear()} • Administrada por {currentUser?.name}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-on-background bg-background font-sans relative pb-20 md:pb-0">
      
      {/* HEADER TOP BAR */}
      <header className="fixed top-0 left-0 right-0 w-full z-40 flex justify-between items-center px-margin-mobile md:px-10 h-16 bg-background border-b-2 border-surface-variant transition-all">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-black tracking-tighter uppercase text-xl md:text-2xl text-primary-container">
            {GAMES.find((g) => g.id === selectedGame)?.name || 'FLIP7'} - PLACAR
          </h1>
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary-container text-on-secondary-container">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span> LIVE SERVER
          </span>
        </div>
        <div className="flex gap-2 items-center">
          <div className="hidden sm:flex items-center gap-2 mr-2 px-3 py-1 bg-surface-container border border-surface-variant rounded-full text-xs font-mono font-bold text-on-surface-variant">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate max-w-[120px]">{currentUser?.name || 'Jogador'}</span>
          </div>
          <button 
            onClick={() => handleSelectGame(null)}
            className="flex items-center gap-1.5 bg-surface-container hover:bg-surface-container-high text-primary hover:text-primary-fixed border border-surface-variant transition-all px-3 py-1.5 rounded-xl text-xs font-mono font-black cursor-pointer"
            title="Escolher outro Jogo"
          >
            <Gamepad2 className="w-4 h-4 text-primary" />
            <span className="hidden md:inline uppercase tracking-wider">Trocar Jogo</span>
          </button>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center justify-center text-primary hover:text-primary-fixed hover:bg-surface-container-high transition-colors p-2 rounded-full cursor-pointer ${activeTab === 'dashboard' ? 'bg-surface-container-high text-primary-container' : ''}`}
            title="Dashboard"
          >
            <Trophy className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('players')}
            className={`flex items-center justify-center text-primary hover:text-primary-fixed hover:bg-surface-container-high transition-colors p-2 rounded-full cursor-pointer ${activeTab === 'players' ? 'bg-surface-container-high text-primary-container' : ''}`}
            title="Jogadores"
          >
            <Users className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center justify-center text-primary hover:text-primary-fixed hover:bg-surface-container-high transition-colors p-2 rounded-full cursor-pointer ${activeTab === 'history' ? 'bg-surface-container-high text-primary-container' : ''}`}
            title="Histórico"
          >
            <HistoryIcon className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center justify-center text-primary hover:text-primary-fixed hover:bg-surface-container-high transition-colors p-2 rounded-full cursor-pointer ${activeTab === 'settings' ? 'bg-surface-container-high text-primary-container' : ''}`}
            title="Configurações"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors p-2 rounded-full cursor-pointer"
            title="Sair do Placar"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* DESKTOP SIDE BAR */}
      <aside className="hidden md:flex flex-col h-screen fixed left-0 top-0 pt-20 pb-8 px-4 bg-surface-container-lowest border-r-2 border-surface-variant w-64 z-30">
        <div className="mb-6 px-4 py-3 bg-surface-container rounded-xl border border-surface-variant">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-on-primary-container font-black text-sm uppercase">
              {(currentUser?.name || 'J').slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-xs font-bold text-on-surface uppercase tracking-wider truncate">{currentUser?.name || 'Jogador'}</p>
              <p className="text-[10px] text-on-surface-variant font-medium truncate">{currentUser?.email || 'Acesso Jogatina'}</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-1 flex-grow">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-secondary-container text-on-secondary-container font-bold border-b-2 border-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 text-tertiary-container" />
            <span className="font-mono text-xs tracking-wider uppercase">Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer ${
              activeTab === 'players'
                ? 'bg-secondary-container text-on-secondary-container font-bold border-b-2 border-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <Users className="w-5 h-5 text-tertiary-container" />
            <span className="font-mono text-xs tracking-wider uppercase">Jogadores</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-secondary-container text-on-secondary-container font-bold border-b-2 border-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <HistoryIcon className="w-5 h-5 text-tertiary-container" />
            <span className="font-mono text-xs tracking-wider uppercase">Histórico</span>
          </button>

          <button
            onClick={() => {
              setNewTableName('');
              setActiveTab('new_game');
            }}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer ${
              activeTab === 'new_game'
                ? 'bg-secondary-container text-on-secondary-container font-bold border-b-2 border-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <PlusCircle className="w-5 h-5 text-tertiary-container" />
            <span className="font-mono text-xs tracking-wider uppercase">Nova Mesa</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-secondary-container text-on-secondary-container font-bold border-b-2 border-on-secondary-container'
                : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
            }`}
          >
            <Settings className="w-5 h-5 text-tertiary-container" />
            <span className="font-mono text-xs tracking-wider uppercase">Configurações</span>
          </button>

          {activeTable && activeTable.status === 'active' && (
            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all animate-pulse cursor-pointer ${
                activeTab === 'live'
                  ? 'bg-secondary-container text-on-secondary-container font-bold border-b-2 border-on-secondary-container'
                  : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
              }`}
            >
              <Play className="w-5 h-5 text-primary-container" />
              <span className="font-mono text-xs tracking-wider uppercase text-primary-container">Partida Ativa</span>
            </button>
          )}
        </nav>

        <div className="mt-auto space-y-2">
          <button 
            onClick={handleQuickAddScore}
            className="w-full py-3 bg-primary-container text-on-primary-container font-mono text-xs font-bold tracking-widest rounded-xl border-b-2 border-black active:scale-95 transition-all glow-primary cursor-pointer uppercase font-black"
          >
            {activeTable && activeTable.status === 'active' ? 'Painel de Jogo' : 'Criar Mesa Rápida'}
          </button>
          
          <button 
            onClick={handleLogout}
            className="w-full py-2.5 bg-surface-container text-on-surface hover:bg-error-container/20 hover:text-error font-mono text-[10px] font-bold tracking-widest rounded-xl border border-surface-variant flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer uppercase"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair do Placar</span>
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-40 flex justify-around items-center px-2 py-3 bg-surface-container-lowest border-t-2 border-surface-variant shadow-2xl rounded-t-2xl">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
            activeTab === 'dashboard' ? 'bg-primary-container text-on-primary-container border-b-2 border-on-primary-container' : 'text-on-surface-variant'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="font-mono text-[10px] tracking-wider uppercase mt-1">Painel</span>
        </button>

        <button
          onClick={() => setActiveTab('players')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
            activeTab === 'players' ? 'bg-primary-container text-on-primary-container border-b-2 border-on-primary-container' : 'text-on-surface-variant'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="font-mono text-[10px] tracking-wider uppercase mt-1">Jogadores</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
            activeTab === 'history' ? 'bg-primary-container text-on-primary-container border-b-2 border-on-primary-container' : 'text-on-surface-variant'
          }`}
        >
          <HistoryIcon className="w-5 h-5" />
          <span className="font-mono text-[10px] tracking-wider uppercase mt-1">Histórico</span>
        </button>

        <button
          onClick={() => {
            setNewTableName('');
            setActiveTab('new_game');
          }}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
            activeTab === 'new_game' ? 'bg-primary-container text-on-primary-container border-b-2 border-on-primary-container' : 'text-on-surface-variant'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span className="font-mono text-[10px] tracking-wider uppercase mt-1">Novo</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all ${
            activeTab === 'settings' ? 'bg-primary-container text-on-primary-container border-b-2 border-on-primary-container' : 'text-on-surface-variant'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span className="font-mono text-[10px] tracking-wider uppercase mt-1">Ajustes</span>
        </button>

        {activeTable && activeTable.status === 'active' && (

          <button
            onClick={() => setActiveTab('live')}
            className={`flex flex-col items-center justify-center px-3 py-1 rounded-xl transition-all animate-pulse ${
              activeTab === 'live' ? 'bg-secondary-container text-on-secondary-container border-b-2 border-on-secondary-container' : 'text-primary-container'
            }`}
          >
            <Play className="w-5 h-5" />
            <span className="font-mono text-[10px] tracking-wider uppercase mt-1">Live</span>
          </button>
        )}
      </nav>

      {/* MOBILE QUICK ACTION FAB */}
      <button
        onClick={handleQuickAddScore}
        className="md:hidden fixed right-6 bottom-24 w-14 h-14 bg-primary-container text-on-primary-container rounded-full shadow-2xl flex items-center justify-center border-b-4 border-black z-30 active:scale-90 transition-transform cursor-pointer"
        title="Quick scoring"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* MAIN LAYOUT WRAPPER */}
      <main className="pt-20 pb-28 md:pb-8 md:pl-72 px-margin-mobile md:pr-10 min-h-screen">
        
        {/* --- VIEW: DASHBOARD --- */}
        {activeTab === 'dashboard' && (
          <div className="max-w-5xl mx-auto space-y-6">
            
            {/* WELCOME BLOCK */}
            <section className="bg-surface-container rounded-2xl p-6 border-l-4 border-primary-container relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-primary-container/5 rounded-full blur-2xl"></div>
              <h2 className="font-display font-black text-2xl md:text-3xl text-primary mb-2">
                Bem-vindo a JOGATINA!
              </h2>
              <p className="text-on-surface-variant text-sm md:text-base">
                A mesa está pronta. <span className="text-primary-container font-bold">1 jogo ativo</span> e <span className="text-tertiary-container font-bold">{players.length} jogadores cadastrados</span>.
              </p>
            </section>

            {/* HIGH-LEVEL DATABASE STATS CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-container border border-surface-variant/40 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute right-2 top-2 opacity-5">
                  <Gamepad2 className="w-12 h-12 text-primary" />
                </div>
                <p className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Partidas Salvas</p>
                <p className="font-display font-black text-2xl text-primary mt-2">
                  {new Set(dbHistory.map(h => h.matchId)).size}
                </p>
                <span className="text-[10px] text-on-surface-variant mt-1">Registradas no banco</span>
              </div>

              <div className="bg-surface-container border border-surface-variant/40 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute right-2 top-2 opacity-5">
                  <Trophy className="w-12 h-12 text-primary" />
                </div>
                <p className="font-display font-black text-lg text-primary-container mt-2 truncate max-w-full">
                  {(() => {
                    const winCounts: Record<string, number> = {};
                    dbHistory.filter(h => h.isWinner).forEach(h => {
                      winCounts[h.playerName] = (winCounts[h.playerName] || 0) + 1;
                    });
                    let topPlayerName = "-";
                    let topPlayerWins = 0;
                    Object.entries(winCounts).forEach(([name, wins]) => {
                      if (wins > topPlayerWins) {
                        topPlayerWins = wins;
                        topPlayerName = name;
                      }
                    });
                    return topPlayerName !== "-" ? `${topPlayerName} (${topPlayerWins} v)` : "Nenhum";
                  })()}
                </p>
                <p className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">Líder de Vitórias</p>
              </div>

              <div className="bg-surface-container border border-surface-variant/40 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute right-2 top-2 opacity-5">
                  <Sparkles className="w-12 h-12 text-primary" />
                </div>
                <p className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Recorde de Pontos</p>
                <p className="font-display font-black text-2xl text-tertiary mt-2">
                  {dbHistory.length > 0 ? Math.max(...dbHistory.map(h => h.score)) : 0} pts
                </p>
                <span className="text-[10px] text-on-surface-variant mt-1">Pontuação máxima</span>
              </div>

              <div className="bg-surface-container border border-surface-variant/40 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden">
                <div className="absolute right-2 top-2 opacity-5">
                  <BarChart2 className="w-12 h-12 text-primary" />
                </div>
                <p className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">Média Geral</p>
                <p className="font-display font-black text-2xl text-on-surface mt-2">
                  {dbHistory.length > 0 ? Math.round(dbHistory.reduce((sum, h) => sum + h.score, 0) / dbHistory.length) : 0} pts
                </p>
                <span className="text-[10px] text-on-surface-variant mt-1">Média de pontuação</span>
              </div>
            </div>

            {/* BENTO GRID LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Active Game Card (Large) */}
              <div className="lg:col-span-8 bg-surface-container border-l-4 border-primary-container rounded-2xl p-6 primary-glow relative overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="font-mono text-[10px] font-bold text-tertiary-fixed-dim px-2 py-0.5 bg-on-tertiary rounded uppercase">
                        MESA ATIVA ATUAL
                      </span>
                      <h3 className="font-display font-bold text-xl md:text-2xl text-on-surface mt-2">
                        {activeTable && activeTable.status === 'active' && (activeTable.game === selectedGame || (!activeTable.game && selectedGame === 'flip7')) ? activeTable.name : `Torneio de ${GAMES.find(g => g.id === selectedGame)?.name}`}
                      </h3>
                    </div>
                    <div>
                      <span className="flex items-center gap-1 text-xs font-bold text-on-surface-variant bg-surface-variant px-3 py-1 rounded-full uppercase tracking-wider font-mono">
                        <Timer className="w-3.5 h-3.5" /> 
                        Rodada {activeTable && activeTable.status === 'active' && (activeTable.game === selectedGame || (!activeTable.game && selectedGame === 'flip7')) ? `${activeTable.currentRound} / ${activeTable.maxRounds}` : `0 / ${GAMES.find(g => g.id === selectedGame)?.defaultMaxRounds}`}
                      </span>
                    </div>
                  </div>

                  {/* Player Score Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
                    {activeTable && activeTable.status === 'active' && (activeTable.game === selectedGame || (!activeTable.game && selectedGame === 'flip7')) ? (
                      activeTable.players.map((p, index) => {
                        const isLeading = currentLeader?.id === p.id;
                        return (
                          <div 
                            key={p.id}
                            className={`bg-surface-container-high p-4 rounded-xl border-b-2 transition-all relative overflow-hidden ${
                              p.isBusted 
                                ? 'border-error opacity-70 busted-overlay' 
                                : isLeading 
                                  ? 'border-primary-container' 
                                  : 'border-surface-variant'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-mono text-xs font-bold text-on-surface-variant uppercase">{p.name}</p>
                              {p.isBusted ? (
                                <span className="text-[9px] font-bold font-mono text-error-container bg-on-error px-1.5 py-0.5 rounded">ESTOUROU</span>
                              ) : isLeading ? (
                                <span className="text-[9px] font-bold font-mono text-primary-fixed bg-on-primary px-1.5 py-0.5 rounded">LIDERANDO</span>
                              ) : null}
                            </div>
                            <p className="font-display font-black text-3xl text-primary-container mt-1">
                              {p.totalScore}
                            </p>
                            
                            {!p.isBusted && (
                              <div className="mt-2.5 w-full bg-surface-variant h-1 rounded-full">
                                <div 
                                  className={`h-full rounded-full ${isLeading ? 'bg-primary-container' : 'bg-secondary'}`} 
                                  style={{ width: `${Math.min(100, (p.totalScore / (activeTable.targetScore || 100)) * 100)}%` }}
                                ></div>
                              </div>
                            )}

                            {p.isBusted && (
                              <div className="absolute inset-0 bg-error-container/5 pointer-events-none flex items-center justify-center rotate-[-12deg]">
                                <span className="font-display font-black text-2xl text-error/30 border-2 border-error/30 px-2 rounded-lg">BUSTED</span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="col-span-2 py-4">
                        <p className="text-on-surface-variant text-sm">Nenhum torneio ativo de {GAMES.find(g => g.id === selectedGame)?.name} no momento.</p>
                        {activeTable && activeTable.status === 'active' && (
                          <p className="text-[11px] text-primary/70 font-mono mt-2 uppercase tracking-wide">
                            (Nota: Há uma mesa de {GAMES.find(g => g.id === activeTable.game)?.name || 'outro jogo'} em andamento)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 font-mono text-xs text-on-surface-variant">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
                    Tempo: {activeTable && activeTable.status === 'active' && (activeTable.game === selectedGame || (!activeTable.game && selectedGame === 'flip7')) ? formatTimer(activeTable.gameTimeSeconds) : '00:00'}
                  </div>
                  {activeTable && activeTable.status === 'active' && (activeTable.game === selectedGame || (!activeTable.game && selectedGame === 'flip7')) ? (
                    <button 
                      onClick={() => setActiveTab('live')}
                      className="bg-primary-container text-on-primary-container font-mono text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl flex items-center gap-2 primary-glow-hover active:scale-95 transition-all cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" /> Abrir Jogatina
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        const gameConfig = GAMES.find((g) => g.id === selectedGame);
                        setNewTableName(`Torneio de ${gameConfig ? gameConfig.name : 'FLIP7'}`);
                        setNewTargetScore(gameConfig ? gameConfig.defaultTarget : 100);
                        setNewMaxRounds(gameConfig ? gameConfig.defaultMaxRounds : 7);
                        setActiveTab('new_game');
                      }}
                      className="bg-primary-container text-on-primary-container font-mono text-xs font-bold tracking-wider uppercase px-4 py-2.5 rounded-xl flex items-center gap-2 primary-glow-hover active:scale-95 transition-all cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Configurar Jogo
                    </button>
                  )}
                </div>
              </div>

              {/* Stats/History Summary Card */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* RECENT MATCHES BOX */}
                <div className="bg-surface-container-lowest border-2 border-surface-variant rounded-2xl p-5 flex-grow">
                  <h3 className="font-mono text-xs font-bold text-primary tracking-widest uppercase mb-4">
                    HISTÓRICO RECENTE
                  </h3>
                  <div className="space-y-4 max-h-[220px] overflow-y-auto custom-scrollbar">
                    {dbHistory.filter((h) => h.isWinner && (h.game === selectedGame || (!h.game && selectedGame === 'flip7'))).length === 0 ? (
                      history.filter((h) => h.game === selectedGame || (!h.game && selectedGame === 'flip7')).length === 0 ? (
                        <div className="text-center py-8">
                          <p className="text-xs text-on-surface-variant font-mono">Nenhuma partida finalizada de {GAMES.find((g) => g.id === selectedGame)?.name} ainda.</p>
                        </div>
                      ) : (
                        history.filter((h) => h.game === selectedGame || (!h.game && selectedGame === 'flip7')).slice(0, 3).map((h) => (
                          <div key={h.id} className="flex items-center gap-3 border-b border-surface-variant pb-3 last:border-b-0 last:pb-0">
                            <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary-container">
                              {h.type === 'Epic' ? (
                                <Trophy className="w-5 h-5 text-primary-container" />
                              ) : h.type === 'FLIP7' ? (
                                <Zap className="w-5 h-5 text-tertiary-fixed-dim" />
                              ) : (
                                <CheckCircle2 className="w-5 h-5 text-secondary-fixed-dim" />
                              )}
                            </div>
                            <div className="flex-grow">
                              <p className="text-sm font-bold text-on-surface">Vitória {h.winnerName}</p>
                              <p className="text-[11px] text-on-surface-variant font-medium">{h.tableName} • {h.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono text-xs font-bold text-primary-container">{h.winnerScore} pts</p>
                              <p className="text-[9px] text-on-surface-variant uppercase font-bold">{h.type}</p>
                            </div>
                          </div>
                        ))
                      )
                    ) : (
                      dbHistory.filter((h) => h.isWinner && (h.game === selectedGame || (!h.game && selectedGame === 'flip7'))).slice(0, 3).map((h) => (
                        <div key={h.id} className="flex items-center gap-3 border-b border-surface-variant pb-3 last:border-b-0 last:pb-0">
                          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary-container">
                            <Trophy className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm font-bold text-on-surface">Vitória {h.playerName}</p>
                            <p className="text-[11px] text-on-surface-variant font-medium">{h.tableName} • {h.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-mono text-xs font-bold text-primary-container">{h.score} pts</p>
                            <p className="text-[9px] text-on-surface-variant uppercase font-bold">{h.game?.toUpperCase() || 'FLIP7'}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Quick Action Card (Novo Jogo) */}
                <div className="bg-secondary-container text-on-secondary-container rounded-2xl p-6 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-115 transition-transform duration-300">
                    <Trophy className="w-32 h-32" />
                  </div>
                  <h3 className="font-display font-black text-xl mb-1 text-on-secondary-container">Novo Jogo</h3>
                  <p className="text-xs mb-4 opacity-80 leading-relaxed">
                    Configure uma nova mesa em segundos, defina a pontuação de limite e convide os competidores.
                  </p>
                  <button 
                    onClick={() => {
                      setNewTableName('');
                      setActiveTab('new_game');
                    }}
                    className="bg-primary text-background font-mono text-xs font-bold tracking-widest px-4 py-2.5 rounded-xl border-b-2 border-black active:translate-y-0.5 transition-all cursor-pointer uppercase"
                  >
                    INICIAR
                  </button>
                </div>

              </div>

              {/* Other Active Tables Row */}
              <div className="lg:col-span-12">
                <h3 className="font-mono text-xs font-bold text-on-surface-variant mb-4 flex items-center gap-2 tracking-widest uppercase">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span> OUTRAS MESAS EM JOGO
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {INITIAL_SIMULATED_TABLES.map((st) => (
                    <div 
                      key={st.id} 
                      className="bg-surface-container-high border border-surface-variant rounded-2xl p-4 hover:border-primary-container transition-all"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-sm text-on-surface">{st.name}</p>
                        <span className="text-[10px] font-mono text-on-surface-variant font-bold bg-surface-container px-2 py-0.5 rounded-full">
                          Rodada {st.round}
                        </span>
                      </div>
                      <div className="space-y-2 pt-1 border-t border-surface-variant/50">
                        {st.players.map((p, pidx) => (
                          <div key={pidx} className="flex justify-between items-center text-xs">
                            <span className="text-on-surface-variant font-medium">{p.name}</span>
                            <span className="font-mono font-black text-primary-container">{p.score} pts</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* --- VIEW: PLAYERS --- */}
        {activeTab === 'players' && (
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header with quick trigger */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-black text-2xl md:text-3xl text-on-surface">
                  Gestão de Jogadores
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Acompanhe as vitórias, médias e estatísticas gerais da liga.
                </p>
              </div>
              <button
                onClick={() => setIsAddPlayerModalOpen(true)}
                className="bg-primary-container text-on-primary-container px-5 py-3 rounded-xl font-mono text-xs font-bold tracking-wider uppercase brutalist-border flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> Cadastrar Jogador
              </button>
            </div>

            {/* Players Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((p) => {
                const isBustedVibe = p.averageScore > 170; // visually aggressive
                return (
                  <div
                    key={p.id}
                    className="player-card-gradient border border-surface-variant hover:border-primary-container/60 rounded-2xl p-5 relative overflow-hidden group hover:scale-[1.01] transition-all"
                  >
                    <div className="absolute top-2 right-2 opacity-5 group-hover:opacity-15 transition-opacity pointer-events-none">
                      <Trophy className="w-20 h-20 text-primary-container" />
                    </div>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full border-2 border-primary-container/40 overflow-hidden bg-surface-container-high relative flex-shrink-0">
                        <Image
                          src={p.avatar}
                          alt={p.name}
                          fill
                          sizes="56px"
                          referrerPolicy="no-referrer"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-lg text-primary">{p.name}</h3>
                        <span className="inline-block font-mono text-[9px] font-black text-tertiary-container bg-on-tertiary-container px-2 py-0.5 rounded uppercase mt-0.5 tracking-wider">
                          {p.style}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 bg-surface-container/40 p-3 rounded-xl border border-surface-variant/30">
                      <div>
                        <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider">VITÓRIAS</p>
                        <p className="font-display font-black text-xl text-primary-container mt-0.5">{p.totalWins}</p>
                      </div>
                      <div>
                        <p className="font-mono text-[9px] text-on-surface-variant uppercase tracking-wider">MÉDIA</p>
                        <p className="font-display font-black text-xl text-tertiary mt-0.5">{p.averageScore} pts</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-surface-variant/40 flex justify-between items-center text-xs text-on-surface-variant">
                      <span className="font-medium">Visto por último: {p.lastPlayed}</span>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setEditingPlayerId(p.id);
                            setEditPlayerName(p.name);
                            setEditPlayerStyle(p.style);
                            setEditPlayerAvatar(p.avatar);
                            setEditPlayerWins(p.totalWins);
                            setEditPlayerAverage(p.averageScore);
                            setIsEditPlayerModalOpen(true);
                          }}
                          className="text-primary hover:text-primary-container flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" /> Editar
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir jogador ${p.name}?`)) {
                              // Optimistic delete: update local state instantly
                              const updatedPlayers = players.filter((item) => item.id !== p.id);
                              savePlayersToLocalStorage(updatedPlayers);
                              setSelectedPlayerIds((prev) => prev.filter((id) => id !== p.id));

                              // Request delete on backend database (if exists/fails, local state is already correctly updated)
                              fetch(`/api/players/${p.id}`, {
                                method: 'DELETE',
                              })
                                .then((res) => res.json())
                                .then((resData) => {
                                  if (resData && resData.error) {
                                    console.warn("Backend deletion response:", resData.error);
                                  }
                                })
                                .catch((err) => console.error("Error deleting player from database:", err));
                            }
                          }}
                          className="text-error hover:text-red-400 flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider font-bold transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" /> Remover
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* History Table Glance */}
            <div className="bg-surface-container rounded-2xl border-2 border-surface-variant overflow-hidden mt-8">
              <div className="px-6 py-4 bg-surface-container-high border-b border-surface-variant">
                <h3 className="font-display font-bold text-lg text-on-surface">Histórico Geral de Partidas</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-surface-variant bg-surface-container/50">
                      <th className="p-4 font-mono text-xs text-on-surface-variant tracking-wider">DATA</th>
                      <th className="p-4 font-mono text-xs text-on-surface-variant tracking-wider">MESA / TORNEIO</th>
                      <th className="p-4 font-mono text-xs text-on-surface-variant tracking-wider">VENCEDOR</th>
                      <th className="p-4 font-mono text-xs text-on-surface-variant tracking-wider">PONTUAÇÃO</th>
                      <th className="p-4 font-mono text-xs text-on-surface-variant tracking-wider">ESTILO</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((h) => (
                      <tr key={h.id} className="border-b border-surface-variant/40 hover:bg-surface-container-high/40 transition-colors">
                        <td className="p-4 text-sm text-on-surface-variant">{h.date}</td>
                        <td className="p-4 text-sm font-bold text-on-surface">{h.tableName}</td>
                        <td className="p-4 text-sm font-semibold text-primary-container flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                          {h.winnerName}
                        </td>
                        <td className="p-4 font-mono text-sm text-tertiary-container">{h.winnerScore} pts</td>
                        <td className="p-4 text-xs">
                          <span className="px-2 py-0.5 rounded-full font-bold bg-surface-variant text-on-surface-variant uppercase">
                            {h.type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* --- VIEW: NEW GAME --- */}
        {activeTab === 'new_game' && (
          <div className="max-w-5xl mx-auto space-y-6">
            
            <section>
              <h2 className="font-display font-black text-2xl md:text-3xl text-primary">
                Criar Nova Mesa
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Configure os parâmetros da mesa, pontuação-alvo e selecione os combatentes.
              </p>
            </section>

            <form onSubmit={handleStartGame} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* Left Column: Settings */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Table Identity */}
                <div className="bg-surface-container p-6 rounded-2xl border border-surface-variant">
                  <label className="font-mono text-xs font-bold text-primary mb-3 block uppercase tracking-wider">
                    NOME DA MESA
                  </label>
                  <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Ex: Torneio de Sexta à Noite"
                    className="w-full bg-background border-2 border-outline-variant focus:border-primary-container focus:ring-0 text-on-surface rounded-xl px-4 py-3 placeholder:text-surface-variant transition-all font-display font-bold text-base"
                  />
                </div>

                {/* Parameters */}
                <div className="bg-surface-container p-6 rounded-2xl border border-surface-variant space-y-6">
                  
                  {/* Target Score */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-mono text-xs font-bold text-primary uppercase tracking-wider">PONTUAÇÃO ALVO</h4>
                      <p className="text-[11px] text-on-surface-variant">Pontuação para vencer o jogo</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewTargetScore(Math.max(50, newTargetScore - 25))}
                        className="bg-surface-container-high w-10 h-10 rounded-full flex items-center justify-center text-primary-container border border-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all font-black text-lg cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={newTargetScore}
                        readOnly
                        className="w-16 bg-transparent border-none text-center font-display font-black text-lg text-primary p-0"
                      />
                      <button
                        type="button"
                        onClick={() => setNewTargetScore(Math.min(500, newTargetScore + 25))}
                        className="bg-surface-container-high w-10 h-10 rounded-full flex items-center justify-center text-primary-container border border-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all font-black text-lg cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Rounds */}
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-mono text-xs font-bold text-primary uppercase tracking-wider">RODADAS</h4>
                      <p className="text-[11px] text-on-surface-variant">Número máximo de rodadas</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setNewMaxRounds(Math.max(3, newMaxRounds - 1))}
                        className="bg-surface-container-high w-10 h-10 rounded-full flex items-center justify-center text-primary-container border border-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all font-black text-lg cursor-pointer"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={newMaxRounds}
                        readOnly
                        className="w-16 bg-transparent border-none text-center font-display font-black text-lg text-primary p-0"
                      />
                      <button
                        type="button"
                        onClick={() => setNewMaxRounds(Math.min(21, newMaxRounds + 1))}
                        className="bg-surface-container-high w-10 h-10 rounded-full flex items-center justify-center text-primary-container border border-surface-variant hover:bg-primary-container hover:text-on-primary-container transition-all font-black text-lg cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                </div>

                {/* Confirm Action */}
                <button
                  type="submit"
                  className="w-full bg-primary-container text-on-primary-container font-display font-black text-lg py-4 rounded-2xl brutalist-border hover:scale-[1.01] active:scale-95 transition-all shadow-lg glow-primary cursor-pointer uppercase tracking-wider"
                >
                  INICIAR PARTIDA
                </button>

              </div>

              {/* Right Column: Player Selection */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex justify-between items-end px-2">
                  <h4 className="font-mono text-xs font-bold text-primary uppercase tracking-wider">SELECIONAR JOGADORES ({selectedPlayerIds.length})</h4>
                  <button
                    type="button"
                    onClick={() => setIsAddPlayerModalOpen(true)}
                    className="text-tertiary-container flex items-center gap-1 font-mono text-xs font-bold hover:underline"
                  >
                    <Plus className="w-4 h-4" /> NOVO JOGADOR
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
                  {players.map((p) => {
                    const isSelected = selectedPlayerIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => togglePlayerSelection(p.id)}
                        className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-surface-container-high border-primary-container'
                            : 'bg-surface-container border-surface-variant hover:bg-surface-container-high'
                        }`}
                      >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container-highest relative flex-shrink-0">
                          <Image
                            src={p.avatar}
                            alt={p.name}
                            fill
                            sizes="40px"
                            referrerPolicy="no-referrer"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-on-surface truncate">{p.name}</div>
                          <div className="text-[10px] text-on-surface-variant font-mono uppercase">{p.style}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-primary-container border-primary-container text-on-primary-container' 
                            : 'border-outline-variant'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[4]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </form>

          </div>
        )}

        {/* --- VIEW: HISTÓRICO --- */}
        {activeTab === 'history' && (
          <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-black text-2xl md:text-3xl text-on-surface">
                  Histórico de Partidas
                </h2>
                <p className="text-sm text-on-surface-variant mt-1">
                  Acompanhe em tempo real todas as partidas salvas no banco de dados.
                </p>
              </div>
              <button
                onClick={fetchDbHistory}
                className="bg-primary-container text-on-primary-container px-4 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase brutalist-border flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" /> Atualizar
              </button>
            </div>

            <div className="bg-surface-container border border-surface-variant rounded-2xl overflow-hidden shadow-xl">
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
                  <p className="font-mono text-xs text-on-surface-variant uppercase tracking-wider animate-pulse">Carregando dados do banco...</p>
                </div>
              ) : dbHistory.length === 0 ? (
                <div className="text-center py-16 px-4">
                  <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant/40">
                    <HistoryIcon className="w-8 h-8" />
                  </div>
                  <h3 className="font-display font-bold text-lg text-on-surface">Nenhuma partida registrada</h3>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-sm mx-auto">
                    Partidas concluídas e finalizadas no modo de pontuação ao vivo serão salvas aqui automaticamente.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-container-high border-b border-surface-variant">
                        <th className="px-6 py-4 font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Data</th>
                        <th className="px-6 py-4 font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Mesa / Torneio</th>
                        <th className="px-6 py-4 font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Jogador</th>
                        <th className="px-6 py-4 font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider text-right">Pontuação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-variant/30">
                      {dbHistory.map((item) => {
                        // Find matching player in local players state to get avatar if available
                        const matchingPlayer = players.find(p => p.id === item.playerId || p.name.toLowerCase() === item.playerName.toLowerCase());
                        const avatarUrl = matchingPlayer?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${item.playerName}`;
                        
                        return (
                          <tr key={item.id} className="hover:bg-surface-container-high/40 transition-colors">
                            {/* DATA */}
                            <td className="px-6 py-4">
                              <span className="font-mono text-xs text-on-surface-variant font-medium">
                                {item.date}
                              </span>
                            </td>
                            {/* MESA / TORNEIO */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] font-bold text-tertiary-fixed-dim px-2 py-0.5 bg-on-tertiary rounded uppercase">
                                  {item.game || 'FLIP7'}
                                </span>
                                <span className="font-display font-bold text-sm text-on-surface">
                                  {item.tableName}
                                </span>
                              </div>
                            </td>
                            {/* JOGADOR */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full border border-primary-container/20 overflow-hidden relative bg-surface-container-high">
                                  <Image
                                    src={avatarUrl}
                                    alt={item.playerName}
                                    fill
                                    sizes="32px"
                                    referrerPolicy="no-referrer"
                                    className="object-cover"
                                  />
                                </div>
                                <div>
                                  <span className="font-bold text-on-surface text-sm flex items-center gap-1.5">
                                    {item.playerName}
                                    {item.isWinner && (
                                      <span className="text-[9px] font-black font-mono text-primary-fixed bg-on-primary px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                        <Trophy className="w-2.5 h-2.5 fill-current" /> VENCEDOR
                                      </span>
                                    )}
                                  </span>
                                </div>
                              </div>
                            </td>
                            {/* PONTUAÇÃO */}
                            <td className="px-6 py-4 text-right">
                              <span className={`font-mono text-sm font-black ${item.isWinner ? 'text-primary-container text-base' : 'text-on-surface-variant'}`}>
                                {item.score} pts
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- VIEW: ACTIVE LIVE GAME SCORER --- */}
        {activeTab === 'live' && activeTable && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Top Stats Banner */}
            <div className="flex items-center justify-between p-4 bg-surface-container rounded-2xl border-b-2 border-outline-variant">
              <div className="flex items-center gap-3">
                <div className="bg-secondary-container p-2.5 rounded-xl text-on-secondary-container">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">TEMPO DE DUELO</p>
                  <p className="font-display font-black text-lg text-primary">{formatTimer(activeTable.gameTimeSeconds)}</p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">MESA: {activeTable.name}</p>
                <p className="font-display font-black text-xl text-tertiary-container">
                  RODADA {activeTable.currentRound.toString().padStart(2, '0')} / {activeTable.maxRounds.toString().padStart(2, '0')}
                </p>
              </div>
            </div>

            {/* Players Status Stack */}
            <div className="space-y-4">
              {activeTable.players.map((p, index) => {
                const isActive = activeTable.activePlayerIndex === index;
                const isWinnerResult = activeTable.status === 'completed';

                return (
                  <div
                    key={p.id}
                    className={`relative rounded-2xl overflow-hidden transition-all border-l-4 ${
                      p.isBusted
                        ? 'bg-surface-container-lowest border-error-container opacity-70'
                        : isActive && !isWinnerResult
                          ? 'bg-surface-container-high border-primary-container active-glow scale-[1.01]'
                          : 'bg-surface-container border-secondary-fixed-dim'
                    }`}
                  >
                    
                    {p.isBusted && <div className="absolute inset-0 busted-overlay pointer-events-none z-10"></div>}

                    <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-container-high relative border border-surface-variant flex-shrink-0">
                          <Image
                            src={p.avatar}
                            alt={p.name}
                            fill
                            sizes="48px"
                            referrerPolicy="no-referrer"
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`font-display font-bold text-lg ${p.isBusted ? 'text-on-surface-variant line-through' : 'text-on-surface'}`}>
                              {p.name}
                            </h3>
                            {isActive && !isWinnerResult && (
                              <span className="inline-flex items-center gap-1 font-mono text-[8px] font-bold text-primary-container bg-on-primary px-2 py-0.5 rounded-full uppercase tracking-wider">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary-container animate-pulse"></span> JOGANDO AGORA
                              </span>
                            )}
                          </div>
                          
                          <p className="font-mono text-[10px] text-on-surface-variant uppercase mt-1">
                            {p.isBusted 
                              ? 'Estourou nesta rodada (0 pts)' 
                              : `Histórico Rodadas: [${p.history.join(', ') || 'Nenhum'}]`}
                          </p>
                        </div>
                      </div>

                      {/* Score values */}
                      <div className="flex items-center gap-6 justify-between sm:justify-end">
                        
                        {/* Current round accumulation visual */}
                        {isActive && !isWinnerResult && !p.isBusted && (
                          <div className="text-right">
                            <span className="font-mono text-[8px] font-bold text-tertiary-fixed-dim uppercase tracking-wider">RODADA ACUMULADO</span>
                            <p className="font-display font-black text-xl text-tertiary-fixed-dim">+{p.score} pts</p>
                          </div>
                        )}

                        <div className="text-right min-w-[70px]">
                          <span className="font-mono text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">TOTAL SCORE</span>
                          <p className={`font-display font-black text-2xl ${p.isBusted ? 'text-error' : 'text-primary-container'}`}>
                            {p.totalScore}
                          </p>
                        </div>

                      </div>

                    </div>

                    {/* Quick hit action triggers (active player only) */}
                    {isActive && !isWinnerResult && !p.isBusted && (
                      <div className="bg-surface-container px-5 py-4 border-t border-surface-variant flex flex-col gap-3 animate-fade-in">
                        
                        <div className="flex items-center justify-between">
                          <p className="font-mono text-[9px] font-black text-on-surface-variant uppercase tracking-wider">
                            {(() => {
                              const activeGameId = activeTable.game || selectedGame || 'flip7';
                              if (activeGameId === 'flip7') return 'Simular Cartas Adicionais (Push your luck!)';
                              if (activeGameId === 'catan') return 'Lançar Recursos / Pontos de Vitória';
                              if (activeGameId === 'general') return 'Lançar Combinação de Dados';
                              return 'Lançar Pontos Adicionais';
                            })()}
                          </p>
                          <div className="text-xs font-bold text-primary-container font-mono">
                            Meta: {activeTable.targetScore} pts
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 items-center">
                          {(() => {
                            const activeGameId = activeTable.game || selectedGame || 'flip7';
                            const presets = activeGameId === 'catan' 
                              ? [{ label: '+1', val: 1 }, { label: '+2', val: 2 }, { label: '+3', val: 3 }, { label: '+5', val: 5 }]
                              : activeGameId === 'general'
                              ? [{ label: '+10', val: 10 }, { label: '+25', val: 25 }, { label: '+30', val: 30 }, { label: '+40', val: 40 }, { label: '+50', val: 50 }]
                              : (activeGameId === 'uno' || activeGameId === 'uno_flip' || activeGameId === 'uno_no_mercy')
                              ? [{ label: '+5', val: 5 }, { label: '+10', val: 10 }, { label: '+20', val: 20 }, { label: '+50', val: 50 }, { label: '+100', val: 100 }]
                              : [{ label: '+1', val: 1 }, { label: '+2', val: 2 }, { label: '+3', val: 3 }, { label: '+4', val: 4 }, { label: '+5', val: 5 }, { label: '+6', val: 6 }, { label: '+7', val: 7 }];
                            
                            return presets.map((preset) => (
                              <button
                                key={preset.val}
                                onClick={() => handleAddLivePoints(preset.val)}
                                className="bg-surface-bright text-on-surface hover:bg-surface-container-highest px-3.5 py-2 rounded-xl font-display font-black text-sm border-b-2 border-black active:translate-y-0.5 transition-all cursor-pointer"
                              >
                                {preset.label}
                              </button>
                            ));
                          })()}

                          <div className="w-px bg-outline-variant h-8 mx-1"></div>

                          {/* Custom Score input inside active actions */}
                          <div className="flex items-center gap-1.5 bg-surface-bright border border-surface-variant rounded-xl p-1 ml-1">
                            <input
                              type="number"
                              value={customPoints}
                              onChange={(e) => setCustomPoints(e.target.value)}
                              placeholder="Outro"
                              className="w-16 bg-transparent text-xs font-mono font-bold text-center border-none p-0 focus:outline-none placeholder:text-surface-variant text-on-surface"
                            />
                            <button
                              onClick={handleAddCustomPoints}
                              className="bg-primary-container text-on-primary-container px-2 py-1 rounded-lg text-xs font-bold font-mono border border-black active:scale-95 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Game-specific Extra Quick Actions */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          {(() => {
                            const activeGameId = activeTable.game || selectedGame || 'flip7';
                            if (activeGameId === 'flip7') {
                              return (
                                <>
                                  <button
                                    onClick={handleLiveFlip7}
                                    className="bg-tertiary-container text-on-tertiary-container hover:brightness-110 px-4 py-2 rounded-xl font-display font-black text-xs border-b-2 border-on-tertiary-container active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                                    title="Flip 7 cards with no duplicates!"
                                  >
                                    <Zap className="w-3.5 h-3.5 fill-current text-on-tertiary-container" /> FLIP7
                                  </button>
                                  
                                  <button
                                    onClick={handleLiveBust}
                                    className="bg-error-container text-on-error-container hover:brightness-110 px-4 py-2 rounded-xl font-display font-black text-xs border-b-2 border-on-error active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                                    title="Got a duplicate symbol"
                                  >
                                    <HeartCrack className="w-3.5 h-3.5 text-on-error-container" /> ESTOURAR
                                  </button>
                                </>
                              );
                            }

                            if (activeGameId === 'uno' || activeGameId === 'uno_flip' || activeGameId === 'uno_no_mercy') {
                              return (
                                <button
                                  onClick={() => {
                                    const logMsg = {
                                      playerName: p.name,
                                      message: 'gritou UNO! 🎴',
                                      points: 0,
                                      isBusted: false,
                                      isFlip7: false,
                                    };
                                    setCurrentRoundLogs((prev) => [logMsg, ...prev]);
                                  }}
                                  className="bg-rose-600 text-white hover:brightness-110 px-4 py-2 rounded-xl font-display font-black text-xs border-b-2 border-red-950 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <span>🎴 GRITAR UNO!</span>
                                </button>
                              );
                            }

                            if (activeGameId === 'general') {
                              return (
                                <button
                                  onClick={() => {
                                    handleAddLivePoints(50);
                                    const logMsg = {
                                      playerName: p.name,
                                      message: 'tirou GENERAL de primeira! 🎲',
                                      points: 50,
                                      isBusted: false,
                                      isFlip7: false,
                                    };
                                    setCurrentRoundLogs((prev) => [logMsg, ...prev]);
                                  }}
                                  className="bg-emerald-600 text-white hover:brightness-110 px-4 py-2 rounded-xl font-display font-black text-xs border-b-2 border-emerald-950 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <span>🎲 GENERAL! (+50)</span>
                                </button>
                              );
                            }

                            if (activeGameId === 'catan') {
                              return (
                                <button
                                  onClick={() => {
                                    handleAddLivePoints(2);
                                    const logMsg = {
                                      playerName: p.name,
                                      message: 'conquistou a Maior Estrada / Exército! 🗺️',
                                      points: 2,
                                      isBusted: false,
                                      isFlip7: false,
                                    };
                                    setCurrentRoundLogs((prev) => [logMsg, ...prev]);
                                  }}
                                  className="bg-amber-600 text-white hover:brightness-110 px-4 py-2 rounded-xl font-display font-black text-xs border-b-2 border-amber-950 active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                                >
                                  <span>🗺️ MAIOR ESTRADA (+2)</span>
                                </button>
                              );
                            }

                            return null;
                          })()}
                        </div>

                        {/* Confirmation Button to Bank points */}
                        <div className="flex justify-end gap-2 pt-2 border-t border-surface-variant/30">
                          <button
                            type="button"
                            onClick={handleBankLivePoints}
                            disabled={p.score === 0}
                            className={`px-5 py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                              p.score === 0
                                ? 'bg-surface-variant text-on-surface-variant opacity-50 cursor-not-allowed'
                                : 'bg-primary-container text-on-primary-container hover:brightness-110 cursor-pointer shadow active:scale-95'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4" /> Parar & Salvar Pontos
                          </button>
                        </div>

                      </div>
                    )}

                    {p.isBusted && (
                      <div className="absolute right-14 top-1/2 -translate-y-1/2 rotate-[-12deg] border-4 border-error text-error font-display font-black text-2xl px-4 py-1 rounded-xl opacity-35 select-none pointer-events-none">
                        BUSTED
                      </div>
                    )}

                  </div>
                );
              })}
            </div>

            {/* Victory / Game Finished screen */}
            {activeTable.status === 'completed' && (
              <div className="bg-primary-container text-on-primary-container rounded-2xl p-6 text-center border-b-4 border-black flex flex-col items-center justify-center space-y-4 animate-pop">
                <PartyPopper className="w-14 h-14 text-on-primary-container animate-bounce" />
                <h3 className="font-display font-black text-2xl md:text-3xl">Partida Finalizada!</h3>
                <p className="text-sm font-medium opacity-90 max-w-md">
                  Temos um vencedor! O duelo na mesa <span className="font-bold">{activeTable.name}</span> foi concluído com sucesso.
                </p>
                <div className="bg-on-primary-container/10 p-4 rounded-xl max-w-sm w-full">
                  <p className="font-mono text-[10px] font-bold tracking-widest opacity-80 uppercase">CAMPEÃO DA NOITE</p>
                  <p className="font-display font-black text-xl mt-1 text-primary-fixed">
                    {currentLeader?.name}
                  </p>
                  <p className="font-display font-bold text-lg text-primary">{currentLeader?.totalScore} pts acumulados</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearFinishedGame}
                    className="bg-background text-on-background px-6 py-2.5 rounded-xl font-mono text-xs font-bold tracking-wider uppercase border-b-2 border-black active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    Voltar ao Dashboard
                  </button>
                </div>
              </div>
            )}

            {/* Round History and Record da Noite Bento Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Round History list */}
              <div className="md:col-span-2 bg-surface-container rounded-2xl p-6 border-b-2 border-outline-variant">
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-surface-variant">
                  <h3 className="font-mono text-xs font-bold text-primary tracking-widest uppercase">
                    AÇÕES DESTA RODADA
                  </h3>
                  <span className="text-xs text-on-surface-variant font-medium">Histórico</span>
                </div>
                <div className="space-y-3 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                  {currentRoundLogs.length > 0 ? (
                    currentRoundLogs.map((log, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="font-semibold text-on-surface">{log.playerName}</span>
                        <span className={`font-mono text-xs ${
                          log.isBusted 
                            ? 'text-error font-bold' 
                            : log.isFlip7 
                              ? 'text-tertiary-container font-black' 
                              : 'text-on-surface-variant'
                        }`}>
                          {log.message}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-on-surface-variant italic">Aguardando jogadas da rodada...</p>
                  )}
                </div>
              </div>

              {/* Record block */}
              <div className="bg-primary-container rounded-2xl p-6 flex flex-col justify-center items-center text-on-primary-container text-center border-b-4 border-black">
                <PartyPopper className="w-8 h-8 mb-2" />
                <p className="font-mono text-[9px] font-bold tracking-widest uppercase opacity-80">LÍDER DO TORNEIO</p>
                <p className="font-display font-black text-xl leading-tight text-on-primary-container mt-1">
                  {currentLeader ? currentLeader.name : 'Mariana'}
                </p>
                <p className="font-display font-black text-lg text-primary mt-0.5">
                  {currentLeader ? currentLeader.totalScore : 156} pts
                </p>
              </div>

            </div>

            {/* Live Options Panel */}
            <div className="bg-surface-container/50 border border-surface-variant p-4 rounded-xl flex flex-wrap justify-between items-center gap-4">
              <span className="text-xs text-on-surface-variant font-mono font-medium uppercase tracking-wider">
                Área Administrativa do Mestre
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleResetActiveGame}
                  className="bg-surface-variant hover:bg-surface-container text-on-surface-variant text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5 cursor-pointer transition-all border-b border-black"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reiniciar Jogo
                </button>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza de que deseja encerrar e excluir este jogo?')) {
                      saveActiveTableToLocalStorage(null);
                      setActiveTab('dashboard');
                    }
                  }}
                  className="bg-on-error hover:bg-error-container text-on-error-container text-xs font-bold py-2 px-4 rounded-xl cursor-pointer transition-all border-b border-black"
                >
                  Excluir Mesa
                </button>
              </div>
            </div>

          </div>
        )}

        {/* --- VIEW: SETTINGS --- */}
        {activeTab === 'settings' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            <section className="mb-4">
              <h2 className="font-display font-black text-2xl md:text-3xl text-primary flex items-center gap-2">
                <Settings className="w-7 h-7 text-primary" /> CONFIGURAÇÕES DO PLACAR
              </h2>
              <p className="text-sm text-on-surface-variant mt-1">
                Personalize o comportamento da jogatina, gerencie preferências locais e controle os dados salvos.
              </p>
            </section>

            {settingsMessage && (
              <div className={`p-4 rounded-xl font-mono text-xs font-bold border-l-4 flex items-center gap-2 animate-pop ${
                settingsMessage.type === 'success' 
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500' 
                  : 'bg-error/10 text-error border-error'
              }`}>
                {settingsMessage.type === 'success' ? <Check className="w-4 h-4 text-emerald-400" /> : <X className="w-4 h-4 text-error" />}
                {settingsMessage.text}
              </div>
            )}

            {/* DATABASE & PERSISTENCE CARD */}
            <div className="bg-surface-container border border-surface-variant/40 rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute right-4 top-4 opacity-5">
                <Trash2 className="w-16 h-16 text-primary" />
              </div>
              
              <h3 className="font-display font-black text-lg text-primary uppercase mb-1">
                Banco de Dados & Memória
              </h3>
              <p className="text-xs text-on-surface-variant mb-6">
                Gerencie os registros salvos localmente e no banco de dados em nuvem Cloud SQL.
              </p>

              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-background border border-outline-variant rounded-2xl">
                  <div>
                    <h4 className="font-display font-black text-sm text-on-surface uppercase">
                      Limpar Histórico das Jogadas
                    </h4>
                    <p className="text-[11px] text-on-surface-variant max-w-md mt-0.5">
                      Apaga todas as partidas finalizadas registradas no banco de dados e na memória do navegador. Esta operação é irreversível.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleClearDbHistory}
                    disabled={isClearingHistory}
                    className="md:self-center py-2.5 px-5 bg-error hover:bg-error/80 disabled:bg-surface-variant text-white font-mono text-xs font-black tracking-wider uppercase rounded-xl border-b-2 border-red-950 hover:border-transparent active:translate-y-0.5 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-md shadow-error/10 shrink-0"
                  >
                    {isClearingHistory ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span>
                        LIMPANDO...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        LIMPAR HISTÓRICO
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* APP PREFERENCES CARD */}
            <div className="bg-surface-container border border-surface-variant/40 rounded-3xl p-6">
              <h3 className="font-display font-black text-lg text-primary uppercase mb-1">
                Preferências Locais
              </h3>
              <p className="text-xs text-on-surface-variant mb-6">
                Ajuste os mecanismos internos do painel para se adequar ao ritmo do seu grupo.
              </p>

              <div className="divide-y divide-surface-variant/30">
                {/* PREF 1: SOUND */}
                <div className="py-4 flex items-center justify-between gap-4 first:pt-0">
                  <div>
                    <h4 className="font-display font-black text-sm text-on-surface uppercase">
                      Efeitos Sonoros do Mestre
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Tocar alarmes visuais e efeitos ao estourar cartas ou registrar pontuação.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !prefSound;
                      setPrefSound(newValue);
                      localStorage.setItem('flip7_pref_sound', String(newValue));
                    }}
                    className={`w-12 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                      prefSound ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all shadow ${
                      prefSound ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* PREF 2: QUICK SCORE */}
                <div className="py-4 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-display font-black text-sm text-on-surface uppercase">
                      Pontuação Rápida por Toque
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Incrementar pontuação do jogador selecionado diretamente ao clicar nas cartas numéricas.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !prefQuickScore;
                      setPrefQuickScore(newValue);
                      localStorage.setItem('flip7_pref_quick_score', String(newValue));
                    }}
                    className={`w-12 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                      prefQuickScore ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all shadow ${
                      prefQuickScore ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* PREF 3: STRICT RULES */}
                <div className="py-4 flex items-center justify-between gap-4 last:pb-0">
                  <div>
                    <h4 className="font-display font-black text-sm text-on-surface uppercase">
                      Modo Competitivo Estrito
                    </h4>
                    <p className="text-[11px] text-on-surface-variant mt-0.5">
                      Exigir confirmações adicionais para desfazer rodadas e limitar o número de penalidades por partida.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      const newValue = !prefStrictRules;
                      setPrefStrictRules(newValue);
                      localStorage.setItem('flip7_pref_strict_rules', String(newValue));
                    }}
                    className={`w-12 h-6 rounded-full p-0.5 transition-all cursor-pointer ${
                      prefStrictRules ? 'bg-primary' : 'bg-surface-container-highest border border-outline-variant'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full bg-white transition-all shadow ${
                      prefStrictRules ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* ABOUT APPLICATION */}
            <div className="bg-surface-container/40 border border-surface-variant/30 rounded-3xl p-6 text-center">
              <p className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant/70">
                Sistema Placar Multi-Jogos • Versão 3.5.0
              </p>
              <p className="text-xs text-on-surface-variant mt-2">
                Conectado com sucesso à base de dados relacional Cloud SQL e sincronizado em tempo real.
              </p>
            </div>

          </div>
        )}

      </main>

      {/* --- ADD PLAYER MODAL --- */}
      {isAddPlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-margin-mobile">
          <div 
            onClick={() => setIsAddPlayerModalOpen(false)} 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
          ></div>
          
          <div className="bg-surface-container rounded-2xl w-full max-w-md relative z-10 border-2 border-primary-container glow-primary overflow-hidden animate-pop">
            <div className="p-6 space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="font-display font-black text-xl text-primary uppercase">Novo Jogador</h3>
                <button 
                  onClick={() => setIsAddPlayerModalOpen(false)} 
                  className="text-on-surface-variant hover:text-error transition-colors cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePlayer} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                    NOME DO JOGADOR
                  </label>
                  <input
                    type="text"
                    required
                    value={addPlayerName}
                    onChange={(e) => setAddPlayerName(e.target.value)}
                    placeholder="Ex: Rick Sanchez"
                    className="w-full bg-surface-container-highest border-2 border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-tertiary focus:ring-0 focus:outline-none transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                    SELECIONE O AVATAR
                  </label>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {PRESET_AVATARS.map((avatarUrl, idx) => {
                      const isSelected = addPlayerAvatar === avatarUrl;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAddPlayerAvatar(avatarUrl)}
                          className={`relative w-12 h-12 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                            isSelected ? 'border-primary scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Image
                            src={avatarUrl}
                            alt={`Avatar ${idx + 1}`}
                            fill
                            sizes="48px"
                            referrerPolicy="no-referrer"
                            className="object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={addPlayerAvatar}
                    onChange={(e) => setAddPlayerAvatar(e.target.value)}
                    placeholder="Ou cole a URL de uma imagem personalizada"
                    className="w-full bg-surface-container-highest border-2 border-outline-variant rounded-xl px-4 py-2 text-xs text-on-surface focus:border-tertiary focus:ring-0 focus:outline-none transition-all font-mono"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-mono text-xs font-bold tracking-widest brutalist-border flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer uppercase"
                  >
                    <CheckCircle2 className="w-4 h-4" /> CONFIRMAR CADASTRO
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

      {/* --- EDIT PLAYER MODAL --- */}
      {isEditPlayerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-margin-mobile">
          <div 
            onClick={() => {
              setIsEditPlayerModalOpen(false);
              setEditingPlayerId(null);
            }} 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm cursor-pointer"
          ></div>
          
          <div className="bg-surface-container rounded-2xl w-full max-w-md relative z-10 border-2 border-primary-container glow-primary overflow-hidden animate-pop">
            <div className="p-6 space-y-6">
              
              <div className="flex justify-between items-center">
                <h3 className="font-display font-black text-xl text-primary uppercase">Editar Jogador</h3>
                <button 
                  onClick={() => {
                    setIsEditPlayerModalOpen(false);
                    setEditingPlayerId(null);
                  }} 
                  className="text-on-surface-variant hover:text-error transition-colors cursor-pointer p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditPlayer} className="space-y-4">
                <div>
                  <label className="block font-mono text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                    NOME DO JOGADOR
                  </label>
                  <input
                    type="text"
                    required
                    value={editPlayerName}
                    onChange={(e) => setEditPlayerName(e.target.value)}
                    placeholder="Ex: Rick Sanchez"
                    className="w-full bg-surface-container-highest border-2 border-outline-variant rounded-xl px-4 py-3 text-on-surface focus:border-tertiary focus:ring-0 focus:outline-none transition-all font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] font-bold text-on-surface-variant mb-2 uppercase tracking-wider">
                    SELECIONE O AVATAR
                  </label>
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    {PRESET_AVATARS.map((avatarUrl, idx) => {
                      const isSelected = editPlayerAvatar === avatarUrl;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setEditPlayerAvatar(avatarUrl)}
                          className={`relative w-12 h-12 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                            isSelected ? 'border-primary scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <Image
                            src={avatarUrl}
                            alt={`Avatar ${idx + 1}`}
                            fill
                            sizes="48px"
                            referrerPolicy="no-referrer"
                            className="object-cover"
                          />
                        </button>
                      );
                    })}
                  </div>
                  <input
                    type="text"
                    value={editPlayerAvatar}
                    onChange={(e) => setEditPlayerAvatar(e.target.value)}
                    placeholder="Ou cole a URL de uma imagem personalizada"
                    className="w-full bg-surface-container-highest border-2 border-outline-variant rounded-xl px-4 py-2 text-xs text-on-surface focus:border-tertiary focus:ring-0 focus:outline-none transition-all font-mono"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-primary-container text-on-primary-container py-4 rounded-xl font-mono text-xs font-bold tracking-widest brutalist-border flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 transition-all cursor-pointer uppercase"
                  >
                    <CheckCircle2 className="w-4 h-4" /> SALVAR ALTERAÇÕES
                  </button>
                </div>
              </form>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
