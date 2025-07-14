export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();

  if (isNaN(date.getTime())) {
    return "Not available";
  }

  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60),
  );

  if (diffInMinutes <= 0) {
    return "Just now";
  }

  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 14) {
    return `${diffInDays}d ago`;
  }

  // For more than 2 weeks old, show the actual date
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
