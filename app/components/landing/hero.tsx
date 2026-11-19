import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CourseImage } from "~/components/course-image";
import { CourseMeta } from "~/components/landing/course-meta";
import type {
  CatalogueStats,
  FeaturedCourse,
} from "~/modules/landing-page/index.server";

export function Hero({
  signedIn,
  stats,
  spotlight,
}: {
  signedIn: boolean;
  stats: CatalogueStats;
  spotlight: FeaturedCourse | null;
}) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-28">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            Courses for developers
          </p>
          <h1 className="mt-4 text-5xl font-bold tracking-tight sm:text-6xl">
            Learn to code,
            <br />
            <span className="text-muted-foreground">at your own pace</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Structured courses built by experienced instructors. Track your
            progress, take quizzes, and build real-world skills.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/courses">
                Browse Courses
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              {signedIn ? (
                <Link to="/dashboard">Go to your dashboard</Link>
              ) : (
                <Link to="/signup">Create a free account</Link>
              )}
            </Button>
          </div>
          <StatsRow stats={stats} />
        </div>
        {spotlight && <Spotlight course={spotlight} />}
      </div>
    </section>
  );
}

function StatsRow({ stats }: { stats: CatalogueStats }) {
  const items = [
    { value: stats.courses, label: "courses" },
    { value: stats.lessons, label: "lessons" },
    { value: stats.instructors, label: "instructors" },
  ];
  return (
    <dl className="mt-12 flex gap-10 border-t border-border pt-8">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col-reverse">
          <dt className="text-sm text-muted-foreground">{item.label}</dt>
          <dd className="text-3xl font-bold tracking-tight">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Spotlight({ course }: { course: FeaturedCourse }) {
  return (
    <Link
      to={`/courses/${course.slug}`}
      className="group relative block rotate-1 transition-transform hover:rotate-0"
    >
      <div className="absolute -inset-3 -z-10 rounded-2xl bg-primary/5" />
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
        <CourseImage
          src={course.coverImageUrl}
          alt={course.title}
          className="aspect-video w-full object-cover"
        />
        <div className="p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            New · {course.categoryName}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-snug group-hover:text-primary">
            {course.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
          <CourseMeta course={course} className="mt-4 gap-5" />
        </div>
      </div>
    </Link>
  );
}
