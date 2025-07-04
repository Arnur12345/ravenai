// Utility functions for formatting dates, durations, and other display values

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Not available';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatDuration = (startTime?: string | null, endTime?: string | null): string => {
  if (!startTime) return 'Not started';
  if (!endTime) return 'In progress';
  
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  } catch (error) {
    return 'Duration unknown';
  }
};

export const formatMeetingDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
};

export const formatTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return 'Invalid time';
  }
};

export const formatReadingTime = (minutes: number): string => {
  if (minutes < 1) return 'Less than 1 min';
  if (minutes === 1) return '1 min';
  return `${minutes} mins`;
};

export const formatWordCount = (count: number): string => {
  if (count < 1000) return `${count} words`;
  if (count < 1000000) return `${(count / 1000).toFixed(1)}K words`;
  return `${(count / 1000000).toFixed(1)}M words`;
}; 