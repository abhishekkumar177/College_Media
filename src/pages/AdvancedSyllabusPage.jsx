import AdvancedSyllabus from '../components/AdvancedSyllabus';

const AdvancedSyllabusPage = () => {
  const courseMaterial = [
    {
      title: 'Module 1: Fundamentals',
      subtitle: 'Master the basics',
      lessons: [
        {
          title: 'Introduction to Concepts',
          description: 'Learn the foundational concepts and core principles that underpin this field of study. We will explore the historical context and evolution of these ideas.',
          topics: ['Basics', 'History', 'Principles']
        },
        {
          title: 'Setting Up Your Environment',
          description: 'Get your development environment ready with all necessary tools and configurations. This lesson covers installation, verification, and troubleshooting.',
          topics: ['Setup', 'Configuration', 'Tools']
        },
        {
          title: 'Your First Project',
          description: 'Create your first project from scratch. Follow along as we build a simple yet functional application to apply the concepts learned.',
          topics: ['Practice', 'Hands-on', 'Practical']
        }
      ]
    },
    {
      title: 'Module 2: Advanced Techniques',
      subtitle: 'Deepen your knowledge',
      lessons: [
        {
          title: 'Intermediate Patterns',
          description: 'Discover design patterns and architectural approaches used by professionals. These patterns solve common problems elegantly and improve code maintainability.',
          topics: ['Design Patterns', 'Architecture', 'Best Practices']
        },
        {
          title: 'Performance Optimization',
          description: 'Learn techniques to optimize your applications for speed and efficiency. We will cover profiling, caching, and algorithmic improvements.',
          topics: ['Performance', 'Optimization', 'Profiling']
        },
        {
          title: 'Testing and Debugging',
          description: 'Master the art of writing tests and debugging code efficiently. Includes unit testing, integration testing, and advanced debugging techniques.',
          topics: ['Testing', 'Debugging', 'Quality Assurance']
        },
        {
          title: 'Security Best Practices',
          description: 'Understand security principles and how to implement them in your applications. Covers authentication, encryption, and common vulnerabilities.',
          topics: ['Security', 'Authentication', 'Encryption']
        }
      ]
    },
    {
      title: 'Module 3: Real-World Applications',
      subtitle: 'Apply what you learned',
      lessons: [
        {
          title: 'Building Scalable Systems',
          description: 'Learn how to architect systems that can grow with your needs. We will discuss load balancing, database scaling, and microservices architecture.',
          topics: ['Scalability', 'Microservices', 'Architecture']
        },
        {
          title: 'Deployment and DevOps',
          description: 'Take your applications from development to production. Covers containerization, continuous integration, and deployment strategies.',
          topics: ['Deployment', 'DevOps', 'CI/CD']
        },
        {
          title: 'Case Studies and Projects',
          description: 'Analyze real-world case studies and complete capstone projects. Apply all learned concepts to solve complex, practical problems.',
          topics: ['Case Study', 'Project', 'Capstone']
        }
      ]
    }
  ];

  return (
    <div className="advanced-syllabus-page">
      <div style={{ paddingBottom: '40px' }}>
        <h1 style={{ textAlign: 'center', fontSize: '36px', fontWeight: '700', marginBottom: '10px' }}>
          Advanced Course Syllabus
        </h1>
      </div>
      <AdvancedSyllabus courseMaterial={courseMaterial} />
    </div>
  );
};

export default AdvancedSyllabusPage;
