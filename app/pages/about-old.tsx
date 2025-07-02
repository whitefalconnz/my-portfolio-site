import Header from "../components/layout/Header"

export default function About() {
  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <Header />
      <main className="container mx-auto px-4 py-16 mt-[120px] md:mt-[88px]">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">About</h1>
          
          <div className="prose dark:prose-invert">
            <p className="text-lg mb-6">
              Hello! I'm [Your Name], a [Your Role] passionate about creating meaningful digital experiences.
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">My Journey</h2>
            <p className="mb-6">
              [Add your background and journey here]
            </p>

            <h2 className="text-2xl font-semibold mt-8 mb-4">Skills</h2>
            <ul className="list-disc pl-6 mb-6">
              <li>Skill 1</li>
              <li>Skill 2</li>
              <li>Skill 3</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
} 