import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Upload, BarChart3, FileText, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { Logo } from "@/components/branding/Logo";
import { HowItWorksFlow } from "@/components/landing/HowItWorksFlow";
import { TrustBadges } from "@/components/landing/TrustBadges";
import { ClientLogos } from "@/components/landing/ClientLogos";
import { ProductShowcase } from "@/components/landing/ProductShowcase";
import { ValueProposition } from "@/components/landing/ValueProposition";
import { SignupProgress } from "@/components/landing/SignupProgress";
import CO2Calculator from '@/components/landing/CO2Calculator';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header/Nav */}
      <header className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50 py-6 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <Logo className="h-12 w-auto" />
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-base">
            <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 font-medium">How It Works</a>
            <a href="#why-circa" className="text-gray-600 hover:text-gray-900 font-medium">Why Circa</a>
            <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 font-medium">Testimonials</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 font-medium">Pricing</a>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="lg" asChild>
              <Link to="/auth/login">Log In</Link>
            </Button>
            <Button className="bg-circa-green hover:bg-circa-green-dark" size="lg" asChild>
              <Link to="/auth/register">Sign Up</Link>
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-28 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-left max-w-xl mx-auto lg:max-w-none">
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">CDP Ready</span>
              <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">GHG Protocol</span>
              <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-sm font-medium">ISO 14064</span>
              <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">Audit Friendly</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-[#004D2F]">Stop Wasting Days<br />on Spreadsheets</span>—<br />
              <span className="text-blue-600">Automate Your<br />Carbon Accounting</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect all your data sources, leverage 400 000+ emission factors, and generate every major 
              sustainability report (CDP, GHG, ESRS) with a single click—freeing up your team from manual work.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Button size="lg" className="bg-[#004D2F] hover:bg-[#003D2F] text-white text-lg px-6" asChild>
                <Link to="/auth/register">
                  Start Your Free 14-Day Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-[#004D2F] text-[#004D2F] hover:bg-[#004D2F]/10 text-lg">
                See It in Action
              </Button>
            </div>
            <p className="text-sm text-gray-500">No credit card required</p>
          </div>
          
          <div className="relative">
            <div className="w-full rounded-xl shadow-2xl overflow-hidden bg-white" style={{ height: '440px' }}>
              <img 
                src="https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                alt="Lush green rolling hills and forest"
                className="w-full h-full object-cover"
                style={{ objectPosition: 'center center' }}
              />
              <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="font-medium">Reduce emissions by 30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-circa-green-dark">
              How Circa Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our streamlined process makes carbon accounting simple and intuitive
            </p>
          </div>
          <HowItWorksFlow />
          <div className="mt-14 text-center">
            <Button className="bg-circa-green hover:bg-circa-green-dark" size="lg" asChild>
              <Link to="/auth/register">
                Upload Your Data Now
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CO2 Calculator Demo Section */}
      <section className="py-14 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-circa-green-dark text-center">Bereken direct je CO₂-voetafdruk</h2>
          <p className="text-center text-gray-600 mb-8">Vul je verbruik in en ontvang een samenvatting per mail. Probeer het nu!</p>
          <CO2Calculator />
        </div>
      </section>

      {/* Value Proposition Stats */}
      <section className="py-14 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <ValueProposition />
        </div>
      </section>
      
      {/* Product Showcase */}
      <section className="py-20 md:py-28 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-circa-green-dark">
              See Circa in Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powerful features designed for carbon management excellence
            </p>
          </div>
          
          <ProductShowcase />
          
          <div className="mt-14 text-center">
            <Button className="bg-circa-green hover:bg-circa-green-dark" size="lg" asChild>
              <Link to="/auth/register">
                See Your Impact Live
              </Link>
            </Button>
          </div>
        </div>
      </section>
      
      {/* Why Circa Section */}
      <section id="why-circa" className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-circa-green-dark">
              Why Companies Choose Circa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Trusted by organizations of all sizes to simplify their carbon accounting journey
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-full bg-circa-green-light flex items-center justify-center mb-6">
                <Check className="h-7 w-7 text-circa-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">Compliance Made Easy</h3>
              <p className="text-gray-600">
                Meet regulatory requirements and stakeholder demands with accurate, auditable carbon reporting.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-full bg-circa-green-light flex items-center justify-center mb-6">
                <svg className="h-7 w-7 text-circa-green" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M16 8V16M12 11V16M8 14V16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Actionable Insights</h3>
              <p className="text-gray-600">
                Transform raw emissions data into strategic decisions with our intelligent analytics platform.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="h-14 w-14 rounded-full bg-circa-green-light flex items-center justify-center mb-6">
                <svg className="h-7 w-7 text-circa-green" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Team Collaboration</h3>
              <p className="text-gray-600">
                Engage your entire organization in your sustainability journey with intuitive collaboration tools.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 md:py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-circa-green-dark">
              Comprehensive Carbon Management
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to measure, manage, and reduce your carbon footprint.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:translate-y-[-5px]">
              <div className="h-12 w-12 rounded-lg bg-circa-green-light flex items-center justify-center mb-5">
                <Upload className="h-6 w-6 text-circa-green" />
              </div>
              <h3 className="text-lg font-bold mb-3">Data Collection</h3>
              <p className="text-gray-600">
                Simple data uploads with automated validation and matching.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:translate-y-[-5px]">
              <div className="h-12 w-12 rounded-lg bg-circa-green-light flex items-center justify-center mb-5">
                <BarChart3 className="h-6 w-6 text-circa-green" />
              </div>
              <h3 className="text-lg font-bold mb-3">Emissions Dashboard</h3>
              <p className="text-gray-600">
                Track emissions across scopes with real-time visualization.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:translate-y-[-5px]">
              <div className="h-12 w-12 rounded-lg bg-circa-green-light flex items-center justify-center mb-5">
                <FileText className="h-6 w-6 text-circa-green" />
              </div>
              <h3 className="text-lg font-bold mb-3">Custom Reporting</h3>
              <p className="text-gray-600">
                Generate reports tailored to various regulatory frameworks.
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:translate-y-[-5px]">
              <div className="h-12 w-12 rounded-lg bg-circa-green-light flex items-center justify-center mb-5">
                <Target className="h-6 w-6 text-circa-green" />
              </div>
              <h3 className="text-lg font-bold mb-3">Reduction Planning</h3>
              <p className="text-gray-600">
                Set science-based targets and track progress over time.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-circa-green-dark">
              Trusted by Climate Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join hundreds of forward-thinking organizations using Circa to achieve their sustainability goals
            </p>
          </div>
          
          <div className="mb-16">
            <Carousel className="w-full">
              <CarouselContent>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-700 italic">
                          "Circa has transformed how we approach carbon accounting. The platform is intuitive and the insights invaluable."
                        </p>
                        <div className="flex items-center mt-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                          <div>
                            <p className="font-semibold">Sarah Johnson</p>
                            <p className="text-sm text-gray-500">Sustainability Director, TechCorp</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-700 italic">
                          "The level of detail and accuracy Circa provides has been essential for our ESG reporting and investor relations."
                        </p>
                        <div className="flex items-center mt-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                          <div>
                            <p className="font-semibold">Michael Chen</p>
                            <p className="text-sm text-gray-500">CFO, GreenFutures Ltd</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
                <CarouselItem className="md:basis-1/2 lg:basis-1/3">
                  <Card className="border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <svg key={star} className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <p className="text-gray-700 italic">
                          "Implementing Circa has helped us identify emission hotspots we weren't aware of, leading to meaningful reductions."
                        </p>
                        <div className="flex items-center mt-4">
                          <div className="h-10 w-10 rounded-full bg-gray-200 mr-3"></div>
                          <div>
                            <p className="font-semibold">Emma Rodriguez</p>
                            <p className="text-sm text-gray-500">Head of Operations, EcoSolutions</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              </CarouselContent>
            </Carousel>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-70">
            <div className="h-8 w-32 bg-gray-300 rounded"></div>
            <div className="h-8 w-32 bg-gray-300 rounded"></div>
            <div className="h-8 w-32 bg-gray-300 rounded"></div>
            <div className="h-8 w-32 bg-gray-300 rounded"></div>
            <div className="h-8 w-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      </section>
      
      {/* Pricing Section - Updated */}
      <section id="pricing" className="py-16 md:py-24 px-6 bg-circa-green-light">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-circa-green-dark">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
            First 1000 users get complete access for free!
          </p>
          <div className="mb-12">
            <SignupProgress />
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Starter</h3>
                  <div className="text-3xl font-bold mb-1">€199<span className="text-lg font-normal text-gray-500">/mo</span></div>
                  <p className="text-gray-500 text-sm">Billed annually</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-circa-green mr-2" />
                    <span className="text-gray-600">Scope 1 & 2 calculations</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-circa-green mr-2" />
                    <span className="text-gray-600">Basic reporting</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-circa-green mr-2" />
                    <span className="text-gray-600">3 user accounts</span>
                  </div>
                </div>
                <Button className="w-full bg-circa-green hover:bg-circa-green-dark">Get Started</Button>
              </CardContent>
            </Card>
            
            <Card className="border-circa-green shadow-lg relative">
              <div className="absolute top-0 inset-x-0 -mt-4 bg-circa-green text-white py-1 px-3 rounded-full w-fit mx-auto text-sm font-medium">
                Most Popular
              </div>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Business</h3>
                  <div className="text-3xl font-bold mb-1">€399<span className="text-lg font-normal text-gray-500">/mo</span></div>
                  <p className="text-gray-500 text-sm">Billed annually</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-circa-green mr-2" />
                    <span className="text-gray-600">All Scopes 1, 2 & 3</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-circa-green mr-2" />
                    <span className="text-gray-600">Advanced analytics</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-circa-green mr-2" />
                    <span className="text-gray-600">10 user accounts</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-circa-green mr-2" />
                    <span className="text-gray-600">API access</span>
                  </div>
                </div>
                <Button className="w-full bg-circa-green-dark hover:bg-circa-green">Get Started</Button>
              </CardContent>
            </Card>
            
            <Card className="border-gray-200">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-semibold mb-2">Enterprise</h3>
                  <div className="text-2xl font-bold mb-1">Custom</div>
                  <p className="text-gray-500 text-sm">Contact sales</p>
                </div>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-circa-green mr-2" />
                    <span className="text-gray-600">Everything in Business</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-circa-green mr-2" />
                    <span className="text-gray-600">Dedicated support</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-circa-green mr-2" />
                    <span className="text-gray-600">Custom integrations</span>
                  </div>
                  <div className="flex items-center">
                    <Check className="h-5 w-5 text-circa-green mr-2" />
                    <span className="text-gray-600">SSO & advanced security</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-circa-green-dark text-circa-green-dark hover:bg-circa-green-dark/10">Contact Sales</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {/* CTA Section - Enhanced */}
      <section className="py-16 md:py-24 px-6 bg-circa-green relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Start Your Sustainability Journey Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of forward-thinking organizations already reducing their carbon footprint with Circa.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button size="lg" className="bg-white text-circa-green hover:bg-gray-100 text-lg font-semibold shadow-lg hover:shadow-xl transition-all" asChild>
              <Link to="/auth/register">
                Start Saving Time & CO₂
              </Link>
            </Button>
            <Button size="lg" className="bg-circa-green-dark text-white hover:bg-circa-green-darker border-2 border-white text-lg font-semibold transition-all" asChild>
              <Link to="/auth/register">
                Schedule a Demo
              </Link>
            </Button>
          </div>
          <p className="text-white/80 mt-6 font-medium">No credit card required for 14-day free trial</p>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col items-center justify-center space-y-4">
            <Logo variant="light" className="h-8 w-auto" />
            <p>© 2025 Circa. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
