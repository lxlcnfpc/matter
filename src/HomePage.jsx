import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Book, Activity, Settings, Cpu } from "lucide-react";
import logoImage from "@/assets/lxl_logo.png";

const LessonCard = ({
  title,
  description,
  icon: Icon,
  path,
  comingSoon = false,
}) => (
  <Link
    to={comingSoon ? "#" : path}
    className={`block transition-transform hover:scale-105 ${
      comingSoon ? "cursor-not-allowed opacity-70" : ""
    }`}
  >
    <Card className="h-full bg-white/90 backdrop-blur-sm hover:bg-white/95 transition-all">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-6 w-6" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
        {comingSoon && (
          <span className="inline-block mt-2 px-2 py-1 text-sm bg-yellow-100 text-yellow-800 rounded">
            Coming Soon
          </span>
        )}
      </CardContent>
    </Card>
  </Link>
);

const HomePage = () => {
  const lessons = [
    {
      title: "Control Theory & PID",
      description:
        "Learn about control systems, PID controllers, and tune your own system with our interactive simulator.",
      icon: Settings,
      path: "/control-theory",
    },
    {
      title: "Industrial Data Mining",
      description: "Discover knowledge in databases with statistics and AI.",
      icon: Cpu,
      path: "/digital-logic",
      comingSoon: true,
    },
    {
      title: "Design of Experiments",
      description:
        "Design and execute powerful experiments to understand what factors contribute the most to product quality.",
      icon: Activity,
      path: "/signal-processing",
      comingSoon: true,
    },
    {
      title: "Industrial Robotics",
      description:
        "Get to know the basics of employing robots in a production environment.",
      icon: Book,
      path: "/ml-basics",
      comingSoon: true,
    },
    {
      title: "IO-Link",
      description:
        "Explore the possibilities of this useful communication interface for industrial applications.",
      icon: Book,
      path: "/ml-basics",
      comingSoon: true,
    },
  ];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: 'url("/bg-pattern.png")',
      }}
    >
      {/* Semi-transparent overlay */}
      <div className="min-h-screen bg-white/40 backdrop-blur-sm py-8 px-4">
        {/* Logo and Header Section */}
        <div className="container mx-auto text-center mb-12">
          <img
            src={logoImage}
            alt="LxL Logo"
            className="mx-auto mb-6 h-24 w-auto"
          />
          <h1 className="text-4xl font-bold mb-4 text-gray-800">
            Interactive Learning Hub
          </h1>
          <p className="text-xl text-gray-600">
            Choose a lesson to begin your interactive learning journey
          </p>
        </div>

        {/* Cards Grid */}
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {lessons.map((lesson, index) => (
              <LessonCard key={index} {...lesson} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer className="container mx-auto mt-12 text-center text-gray-600">
          <p>
            New lessons are added regularly. Check back soon for more content!
          </p>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;
