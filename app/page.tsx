import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-grid-16" />
        <div className="relative container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-4xl">
            <Badge
              variant="secondary"
              className="mb-6 px-4 py-2 text-sm font-medium"
            >
              🎮 Gamified Learning Platform
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl md:text-7xl">
              Learn Through{" "}
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Play
              </span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Transform education with our gamified platform. Students learn
              through engaging game modules while teachers create interactive
              courses that make learning fun and effective.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link href="/sign-up">Start Learning Today</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-lg px-8 py-6"
              >
                <Link href="/sign-in">I'm a Teacher</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Why Choose GameLearn?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform combines the excitement of gaming with the
            effectiveness of structured learning
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Feature 1 - For Students */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:bg-card/80">
            <CardHeader>
              <div className="mb-2 text-4xl">🎯</div>
              <CardTitle className="text-xl">
                Interactive Game Modules
              </CardTitle>
              <CardDescription>
                Learn through engaging mini-games and interactive challenges
                that make complex concepts easy to understand.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• XP and leveling system</li>
                <li>• Achievement badges</li>
                <li>• Progress tracking</li>
                <li>• Streak counters</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 2 - For Teachers */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:bg-card/80">
            <CardHeader>
              <div className="mb-2 text-4xl">🏗️</div>
              <CardTitle className="text-xl">Course Creation Studio</CardTitle>
              <CardDescription>
                Build gamified courses with our intuitive drag-and-drop
                interface. No coding required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Visual course builder</li>
                <li>• Game templates</li>
                <li>• Analytics dashboard</li>
                <li>• Student progress monitoring</li>
              </ul>
            </CardContent>
          </Card>

          {/* Feature 3 - Analytics */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:bg-card/80">
            <CardHeader>
              <div className="mb-2 text-4xl">📊</div>
              <CardTitle className="text-xl">Smart Analytics</CardTitle>
              <CardDescription>
                Track learning progress with detailed analytics and insights to
                optimize the learning experience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time progress tracking</li>
                <li>• Performance insights</li>
                <li>• Engagement metrics</li>
                <li>• Custom reports</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10K+</div>
              <div className="text-muted-foreground">Active Students</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground">Teachers</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">1000+</div>
              <div className="text-muted-foreground">Game Modules</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">95%</div>
              <div className="text-muted-foreground">Completion Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            How It Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get started in minutes with our simple three-step process
          </p>
        </div>

        <div className="grid gap-12 md:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
              1
            </div>
            <h3 className="text-xl font-semibold mb-4">Sign Up & Explore</h3>
            <p className="text-muted-foreground">
              Create your account and browse through hundreds of gamified
              courses across different subjects.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
              2
            </div>
            <h3 className="text-xl font-semibold mb-4">Play & Learn</h3>
            <p className="text-muted-foreground">
              Engage with interactive game modules, earn XP, unlock
              achievements, and track your progress.
            </p>
          </div>

          <div className="text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-2xl font-bold">
              3
            </div>
            <h3 className="text-xl font-semibold mb-4">Master Skills</h3>
            <p className="text-muted-foreground">
              Complete courses, earn certificates, and apply your newly acquired
              skills in real-world scenarios.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/80 py-20 text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to Transform Learning?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of students and teachers who are already experiencing
            the future of education.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/sign-up">Get Started Free</Link>
            </Button>
            <Button asChild size="lg" variant="default">
              <Link href="/learn">Explore Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50 backdrop-blur-sm py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-lg font-semibold mb-4">GameLearn</h3>
              <p className="text-sm text-muted-foreground">
                Making education engaging through gamification and interactive
                learning experiences.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/learn" className="hover:text-foreground">
                    Browse Courses
                  </Link>
                </li>
                <li>
                  <Link href="/studio" className="hover:text-foreground">
                    Create Course
                  </Link>
                </li>
                <li>
                  <Link href="/play" className="hover:text-foreground">
                    Game Library
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 GameLearn. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
