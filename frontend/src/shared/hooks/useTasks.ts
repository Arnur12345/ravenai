import { useState, useEffect } from 'react';
import { dashboardApi } from '@/shared/api/dashboardApi';
import type { TaskItem, Summary, Meeting } from '@/shared/types/dashboard';

export interface TaskWithMeeting extends TaskItem {
  id: string;
  meeting_id: string;
  meeting_title?: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  source: 'summary' | 'structured_notes';
}

export const useTasks = () => {
  const [tasks, setTasks] = useState<TaskWithMeeting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const extractTasksFromSummary = (summary: Summary, meeting: Meeting): TaskWithMeeting[] => {
    const extractedTasks: TaskWithMeeting[] = [];
    
    try {
      // Попробуем найти задачи в action_items
      if (summary.action_items) {
        const actionItems = typeof summary.action_items === 'string' 
          ? JSON.parse(summary.action_items) 
          : summary.action_items;
          
        if (Array.isArray(actionItems)) {
          actionItems.forEach((item: any, index: number) => {
            if (typeof item === 'string') {
              extractedTasks.push({
                id: `${summary.id}-action-${index}`,
                meeting_id: meeting.id,
                meeting_title: `${meeting.meeting_platform} Meeting`,
                task_name: item,
                task_description: item,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 дней от сегодня
                assignee: 'You',
                priority: 'medium',
                completed: false,
                source: 'summary'
              });
            } else if (item && typeof item === 'object') {
              extractedTasks.push({
                id: `${summary.id}-action-${index}`,
                meeting_id: meeting.id,
                meeting_title: `${meeting.meeting_platform} Meeting`,
                task_name: item.task_name || item.name || item.title || 'Untitled Task',
                task_description: item.task_description || item.description || item.task_name || 'No description',
                deadline: item.deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                assignee: item.assignee || 'You',
                                 priority: 'medium',
                completed: false,
                source: 'summary'
              });
            }
          });
        }
      }

      // Попробуем найти задачи в content (если они есть в виде текста)
      if (summary.content && extractedTasks.length === 0) {
        const taskPatterns = [
          /(?:action\s+items?|tasks?|to[\s-]?do|todo|next\s+steps?):\s*(.+?)(?:\n\n|\n(?=[A-Z])|$)/gis,
          /(?:•|-|\*|\d+\.)\s*(.+?)(?=\n(?:•|-|\*|\d+\.)|$)/gm
        ];

        taskPatterns.forEach(pattern => {
          const matches = summary.content.matchAll(pattern);
          for (const match of matches) {
            const taskText = match[1]?.trim();
            if (taskText && taskText.length > 3) {
              extractedTasks.push({
                id: `${summary.id}-content-${extractedTasks.length}`,
                meeting_id: meeting.id,
                meeting_title: `${meeting.meeting_platform} Meeting`,
                task_name: taskText.substring(0, 100),
                task_description: taskText,
                deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                assignee: 'You',
                priority: 'medium',
                completed: false,
                source: 'summary'
              });
            }
          }
        });
      }
    } catch (error) {
      console.error('Error extracting tasks from summary:', error);
    }

    return extractedTasks;
  };

  const extractTasksFromStructuredNotes = async (meeting: Meeting): Promise<TaskWithMeeting[]> => {
    try {
      const structuredNotes = await dashboardApi.getStructuredNotes(meeting.id);
      if (!structuredNotes || !structuredNotes.notes) {
        return [];
      }

      const tasks: TaskWithMeeting[] = [];
      
      if (structuredNotes.notes.to_do) {
        structuredNotes.notes.to_do.forEach((task: TaskItem, index: number) => {
          tasks.push({
            id: `${meeting.id}-structured-${index}`,
            meeting_id: meeting.id,
            meeting_title: `${meeting.meeting_platform} Meeting`,
            task_name: task.task_name,
            task_description: task.task_description,
            deadline: task.deadline,
            assignee: task.assignee,
            priority: 'medium',
            completed: false,
            source: 'structured_notes'
          });
        });
      }

      return tasks;
    } catch (error) {
      console.error('Error extracting tasks from structured notes:', error);
      return [];
    }
  };



  const loadTasks = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Получаем последние встречи
      const meetingsResponse = await dashboardApi.getMeetings(1, 10);
      const allTasks: TaskWithMeeting[] = [];

      // Для каждой встречи ищем summary и извлекаем задачи
      for (const meeting of meetingsResponse.meetings) {
        try {
          // Сначала пробуем получить structured notes
          const structuredTasks = await extractTasksFromStructuredNotes(meeting);
          allTasks.push(...structuredTasks);

          // Затем пробуем получить summary
          const summaries = await dashboardApi.getMeetingSummaries(meeting.id);
          for (const summary of summaries) {
            const summaryTasks = extractTasksFromSummary(summary, meeting);
            allTasks.push(...summaryTasks);
          }
        } catch (error) {
          console.warn(`Error loading tasks for meeting ${meeting.id}:`, error);
        }
      }

      // Удаляем дубликаты и сортируем по приоритету
      const uniqueTasks = allTasks.filter((task, index, self) => 
        index === self.findIndex(t => t.task_name === task.task_name && t.meeting_id === task.meeting_id)
      );

      // Сортируем по дате создания (самые новые первыми)
      const sortedTasks = uniqueTasks.sort((a, b) => 
        new Date(b.deadline).getTime() - new Date(a.deadline).getTime()
      );

      setTasks(sortedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId 
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return {
    tasks,
    isLoading,
    error,
    loadTasks,
    toggleTaskCompletion
  };
}; 