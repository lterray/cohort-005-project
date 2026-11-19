import { Compass, ListChecks, Trophy } from "lucide-react";

const STEPS = [
  {
    icon: Compass,
    title: "Pick a course",
    body: "Browse the catalogue by topic and find the course that fits where you are.",
  },
  {
    icon: ListChecks,
    title: "Work through lessons",
    body: "Videos, written lessons and quizzes, in order. Your progress is saved as you go.",
  },
  {
    icon: Trophy,
    title: "Build real skills",
    body: "Finish each module with something you built, then move on when you're ready.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-muted/50">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          No schedule, no deadlines. Start when you like and stop when you need
          to.
        </p>
        <ol className="mt-12 grid gap-10 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li key={step.title} className="border-l-2 border-primary pl-6">
              <div className="flex items-center gap-3">
                <step.icon className="size-5 text-primary" />
                <span className="text-sm font-semibold text-muted-foreground">
                  Step {index + 1}
                </span>
              </div>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
