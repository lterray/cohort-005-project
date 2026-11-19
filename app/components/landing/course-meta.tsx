import { BookOpen, User } from "lucide-react";
import { cn } from "~/lib/utils";
import type { FeaturedCourse } from "~/modules/landing-page/index.server";

export function CourseMeta({
  course,
  className,
}: {
  course: FeaturedCourse;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center text-xs text-muted-foreground",
        className
      )}
    >
      <span className="flex items-center gap-1">
        <User className="size-3" />
        {course.instructorName}
      </span>
      <span className="flex items-center gap-1">
        <BookOpen className="size-3" />
        {course.lessonCount} lessons
      </span>
    </div>
  );
}
