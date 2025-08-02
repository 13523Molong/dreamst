export interface Role {
  id: string;
  name: string;
  description: string;
  avatar: string;
  backgroundColor?: string;
}

export interface ChatMessage {
  id: string;
  roleId: string;
  content: string;
  timestamp: number;
  type: 'text' | 'audio';
}

export const DEFAULT_ROLES: Role[] = [
  {
    id: 'role1',
    name: '智慧导师',
    description: '一位博学多才的导师，可以回答各种学术问题',
    avatar: 'https://placekitten.com/200/200',
    backgroundColor: '#E3F2FD'
  },
  {
    id: 'role2',
    name: '创意伙伴',
    description: '富有创造力的伙伴，帮助激发你的想象力',
    avatar: 'https://placekitten.com/201/201',
    backgroundColor: '#F3E5F5'
  },
  {
    id: 'role3',
    name: '心灵咨询师',
    description: '温暖贴心的倾听者，为你提供情感支持',
    avatar: 'https://placekitten.com/202/202',
    backgroundColor: '#E8F5E9'
  },
  {
    id: 'role4',
    name: '效率专家',
    description: '帮助你提高工作效率的专业顾问',
    avatar: 'https://placekitten.com/203/203',
    backgroundColor: '#FFF3E0'
  }
];