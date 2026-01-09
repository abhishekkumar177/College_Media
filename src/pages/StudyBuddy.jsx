import StudyBuddyCard from "../components/StudyBuddy/StudyBuddyCard";

const mockUsers = [
  { id: 1, name: "Aarav", course: "DSA", score: 82, active: true },
  { id: 2, name: "Megha", course: "OS", score: 74, active: false },
  { id: 3, name: "Rohit", course: "DBMS", score: 91, active: true },
];

const StudyBuddy = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Study Buddy Matcher</h2>

      <div className="relative h-[420px]">
        {mockUsers.map((user, index) => (
          <StudyBuddyCard key={user.id} user={user} index={index} />
        ))}
      </div>
    </div>
  );
};

export default StudyBuddy;
