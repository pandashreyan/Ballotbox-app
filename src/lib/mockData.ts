import type { Election, Announcement } from './types';

export const mockElections: Election[] = [
  {
    id: 'presidential-2026',
    name: 'Presidential Election 2026',
    startDate: '2026-10-01',
    endDate: '2026-11-05',
    description: 'The general presidential election for the term 2027-2031.',
    candidates: [
      {
        id: 'candidate-a',
        name: 'Alice Wonderland',
        party: 'Wonderland Party',
        electionId: 'presidential-2026',
        platform: 'Focus on improving education systems nationwide, investing in renewable energy sources, and reforming healthcare to be more accessible and affordable for all citizens. Proposes tax cuts for small businesses to stimulate economic growth.',
        imageUrl: 'https://placehold.co/300x300/E2A829/000000.png?text=AW',
        voteCount: 0,
      },
      {
        id: 'candidate-b',
        name: 'Bob The Builder',
        party: 'Construction Alliance',
        electionId: 'presidential-2026',
        platform: 'Prioritizes infrastructure development, including roads, bridges, and public transport. Advocates for stronger national security measures and supports free-market capitalism. Aims to reduce national debt through fiscal conservatism.',
        imageUrl: 'https://placehold.co/300x300/2980B9/FFFFFF.png?text=BB',
        voteCount: 0,
      },
      {
        id: 'candidate-c',
        name: 'Charlie Brown',
        party: 'Good Grief Party',
        electionId: 'presidential-2026',
        platform: 'Champion for environmental protection and sustainable agriculture. Pushes for social justice reforms and increased funding for public arts and humanities. Believes in universal basic income to address poverty.',
        imageUrl: 'https://placehold.co/300x300/27AE60/FFFFFF.png?text=CB',
        voteCount: 0,
      },
    ],
  },
  {
    id: 'city-mayor-2026',
    name: 'City Mayoral Election 2026',
    startDate: '2026-09-15',
    endDate: '2026-10-20',
    description: 'Election for the Mayor of Springfield.',
    candidates: [
      {
        id: 'candidate-d',
        name: 'Diana Prince',
        party: 'Justice Coalition',
        electionId: 'city-mayor-2026',
        platform: 'Dedicated to improving local community services, enhancing public safety with community policing, and promoting local businesses. Plans to create more green spaces and parks within the city.',
        imageUrl: 'https://placehold.co/300x300/C0392B/FFFFFF.png?text=DP',
        voteCount: 0,
      },
      {
        id: 'candidate-e',
        name: 'Edward Nygma',
        party: 'Riddler Enigma Party',
        electionId: 'city-mayor-2026',
        platform: 'Focuses on technological innovation for city management, smart city initiatives, and improving public transportation efficiency. Proposes a new framework for citizen engagement through digital platforms.',
        imageUrl: 'https://placehold.co/300x300/8E44AD/FFFFFF.png?text=EN',
        voteCount: 0,
      },
    ],
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: 'announcement-1',
    title: 'Election Registration Now Open!',
    content: 'Candidate registration for the upcoming Presidential Election 2026 is now officially open. Visit the registration page to submit your candidacy if you have the "candidate" role.',
    date: '2026-07-15T10:00:00Z',
    imageUrl: 'https://placehold.co/600x300/29ABE2/FFFFFF.png?text=Registration+Open',
  },
  {
    id: 'announcement-2',
    title: 'Voting System Maintenance Scheduled',
    content: 'Please be advised that the voting system will undergo scheduled maintenance on July 20th, 2026, from 2 AM to 4 AM. Voting will be temporarily unavailable during this period.',
    date: '2026-07-10T14:30:00Z',
  },
  {
    id: 'announcement-3',
    title: 'Meet the Mayoral Candidates Forum',
    content: 'Join us for a virtual town hall to meet the candidates for the City Mayoral Election 2026. The event will be streamed live on August 5th, 2026, at 7 PM.',
    date: '2026-07-05T09:00:00Z',
    imageUrl: 'https://placehold.co/600x300/90EE90/000000.png?text=Candidates+Forum',
  },
];
