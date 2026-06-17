import Link from "next/link";
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { ArrowRight, FileText, MessagesSquare, CheckCircle, Target, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect('/dashboard');

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-primary text-white">
              <Target className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">CareerAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</Link>
            <Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link href="/sign-in">Log in</Link>
            </Button>
            <Button asChild className="rounded-full shadow-lg hover:shadow-primary/25 transition-all">
              <Link href="/sign-in">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          {/* Background decoration */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
          <div className="absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20 blur-[100px] bg-primary rounded-full mix-blend-screen"></div>

          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-8 animate-in-up">
              <div className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                The ultimate AI career platform
              </div>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70">
                Land your dream job with AI-powered preparation.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Tailor your resume to beat the ATS in seconds. Practice technical and behavioral interviews with AI. Track every application from save to offer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4 w-full sm:w-auto">
                <Button size="lg" className="h-12 px-8 rounded-full shadow-lg shadow-primary/25 text-base w-full sm:w-auto" asChild>
                  <Link href="/sign-up">
                    Start For Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 rounded-full border-primary/20 hover:bg-primary/5 text-base w-full sm:w-auto" asChild>
                  <Link href="#features">See How It Works</Link>
                </Button>
              </div>

              {/* Stats/Trust badges */}
              <div className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 border-t border-border/50 w-full max-w-4xl mx-auto mt-12 opacity-80">
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-3xl font-bold text-foreground">Free</h3>
                  <p className="text-sm text-muted-foreground text-center">No credit card required</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-3xl font-bold text-foreground">AI</h3>
                  <p className="text-sm text-muted-foreground text-center">Powered by Llama 3.3 70B</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-3xl font-bold text-foreground">2 min</h3>
                  <p className="text-sm text-muted-foreground text-center">Average tailoring time</p>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <h3 className="text-3xl font-bold text-foreground">100%</h3>
                  <p className="text-sm text-muted-foreground text-center">Private & secure</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section id="features" className="py-24 bg-muted/30 border-y border-border/50">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold">Everything you need to get hired</h2>
              <p className="text-muted-foreground text-lg">Our comprehensive suite of tools ensures you are prepared for every stage of the hiring process.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Resume Tailoring</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Upload your base resume and paste a job description. Our AI analyzes the ATS keywords and rewrites your bullet points to maximize your match score without fabricating experience.
                  </p>
                  <ul className="space-y-2 pt-4 border-t border-border/50">
                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> ATS gap analysis</li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> STAR method rewrite</li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> PDF & DOCX export</li>
                  </ul>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400">
                    <MessagesSquare className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Interview Prep</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Generate highly specific mock interview questions based on the role and company. Practice your answers in our simulator and get instant AI feedback and scoring.
                  </p>
                  <ul className="space-y-2 pt-4 border-t border-border/50">
                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> Role-specific topics</li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> Model answers</li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> Live scoring feedback</li>
                  </ul>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <Target className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold">Application Tracker</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    Manage your entire job hunt from a single kanban board. Keep track of which tailored resume you used for which application, and your progress in the pipeline.
                  </p>
                  <ul className="space-y-2 pt-4 border-t border-border/50">
                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> Drag-and-drop board</li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> Version history</li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground"><CheckCircle className="h-4 w-4 text-emerald-500" /> Funnel analytics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Built for modern tech */}
        <section className="py-24">
          <div className="container px-4 md:px-6">
            <div className="rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-8 md:p-16 text-center shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <Shield className="w-64 h-64 text-primary" />
              </div>
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 text-primary mb-4">
                  <Zap className="h-6 w-6" />
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Stop sending generic resumes.</h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Companies use ATS software to filter out 75% of applications before a human ever sees them. CareerAI ensures your resume passes the bot, so you can impress the human.
                </p>
                <div className="pt-6">
                  <Button size="lg" className="h-12 px-8 rounded-full shadow-lg" asChild>
                    <Link href="/sign-up">Create Your Free Account</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20 py-12">
        <div className="container px-4 md:px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span className="font-semibold">CareerAI</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            &copy; {new Date().getFullYear()} CareerAI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
