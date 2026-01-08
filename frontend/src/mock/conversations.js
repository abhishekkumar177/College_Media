const conversations = [
  {
    id: 1,
    user: {
      id: 101,
      name: "Aarav Sharma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav"
    },
    messages: [
      { id: 1, sender: "them", text: "Hey! How's the project going?", timestamp: "10:30 AM" },
      { id: 2, sender: "me", text: "Hi, what's up?", timestamp: "10:32 AM" },
      { id: 3, sender: "them", text: "Working on the project. Need any help?", timestamp: "10:35 AM" },
      { id: 4, sender: "me", text: "Thanks! I'm good for now 👍", timestamp: "10:38 AM" }
    ]
  },
  {
    id: 2,
    user: {
      id: 102,
      name: "Priya Patel",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya"
    },
    messages: [
      { id: 1, sender: "them", text: "Did you get the assignment details?", timestamp: "Yesterday" },
      { id: 2, sender: "me", text: "Yes! Just checked the portal", timestamp: "Yesterday" },
      { id: 3, sender: "them", text: "Great! Let me know if you want to collaborate", timestamp: "Yesterday" }
    ]
  },
  {
    id: 3,
    user: {
      id: 103,
      name: "Rohan Verma",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan"
    },
    messages: [
      { id: 1, sender: "me", text: "Hey, are you coming to the study group?", timestamp: "2 days ago" },
      { id: 2, sender: "them", text: "Sorry, can't make it today", timestamp: "2 days ago" },
      { id: 3, sender: "me", text: "No worries! Next time then", timestamp: "2 days ago" }
    ]
  },
  {
    id: 4,
    user: {
      id: 104,
      name: "Ananya Singh",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya"
    },
    messages: [
      { id: 1, sender: "them", text: "Have you checked out the new library?", timestamp: "3 days ago" },
      { id: 2, sender: "me", text: "Not yet, is it good?", timestamp: "3 days ago" },
      { id: 3, sender: "them", text: "Amazing! Great place to study", timestamp: "3 days ago" },
      { id: 4, sender: "me", text: "Will check it out this week!", timestamp: "3 days ago" }
    ]
  },
  {
    id: 5,
    user: {
      id: 105,
      name: "Karan Mehta",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Karan"
    },
    messages: [
      { id: 1, sender: "them", text: "Got the notes from yesterday's lecture?", timestamp: "Last week" },
      { id: 2, sender: "me", text: "Yes, I'll share them with you", timestamp: "Last week" }
    ]
  }
];

export default conversations;
