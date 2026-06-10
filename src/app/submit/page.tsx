"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { formatINR } from "@/lib/utils/normalization";
import { PlusCircle, Info, Sparkles } from "lucide-react";

const roles = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Solutions Architect",
  "Engineering Manager",
];

const locations = ["Bangalore", "Hyderabad", "Pune", "Remote"];

export default function SubmitPage() {
  const router = useRouter();
  const { data: session } = useSession();

  // Form states
  const [company, setCompany] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [level, setLevel] = useState("");
  const [location, setLocation] = useState(locations[0]);
  const [yoe, setYoe] = useState("");
  const [yoeAtCompany, setYoeAtCompany] = useState("");
  const [base, setBase] = useState("");
  const [bonus, setBonus] = useState("0");
  const [stock, setStock] = useState("0");
  const [totalCompensation, setTotalCompensation] = useState(0);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Calculate total compensation automatically
  useEffect(() => {
    const b = parseFloat(base) || 0;
    const bo = parseFloat(bonus) || 0;
    const s = parseFloat(stock) || 0;
    setTotalCompensation(b + bo + s);
  }, [base, bonus, stock]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage("");
    setLoading(true);

    // Frontend parse & validation
    const numBase = parseFloat(base);
    const numBonus = bonus === "" ? 0 : parseFloat(bonus);
    const numStock = stock === "" ? 0 : parseFloat(stock);
    const numYoe = parseFloat(yoe);
    const numYoeAtCompany = parseFloat(yoeAtCompany);

    const validationErrors: Record<string, string> = {};

    if (!company.trim()) validationErrors.company = "Company name is required";
    if (!level.trim()) validationErrors.level = "Level is required (e.g. L4)";
    
    if (isNaN(numYoe) || numYoe < 0) {
      validationErrors.yoe = "Total YOE must be 0 or greater";
    }
    if (isNaN(numYoeAtCompany) || numYoeAtCompany < 0) {
      validationErrors.yoeAtCompany = "YOE at company must be 0 or greater";
    }
    if (numYoeAtCompany > numYoe) {
      validationErrors.yoeAtCompany = "YOE at company cannot be greater than total YOE";
    }

    if (isNaN(numBase) || numBase <= 0) {
      validationErrors.base = "Base salary must be greater than 0";
    }
    if (numBonus < 0) {
      validationErrors.bonus = "Bonus cannot be negative";
    }
    if (numStock < 0) {
      validationErrors.stock = "Stock value cannot be negative";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company,
          role,
          level,
          location,
          yoe: numYoe,
          yoeAtCompany: numYoeAtCompany,
          base: numBase,
          bonus: numBonus,
          stock: numStock,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        if (resData.details) {
          // Zod error details mapping
          const serverErrors: Record<string, string> = {};
          resData.details.forEach((err: any) => {
            serverErrors[err.path[0]] = err.message;
          });
          setErrors(serverErrors);
        } else {
          setMessage(resData.error || "Submission failed");
        }
      } else {
        setMessage("Salary submitted successfully! Redirecting...");
        setTimeout(() => {
          router.push(session ? "/dashboard" : "/");
          router.refresh();
        }, 1500);
      }
    } catch (err) {
      setMessage("Failed to connect to servers. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="space-y-2 mb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2">
          <PlusCircle className="text-bronze" /> Share Your Compensation
        </h1>
        <p className="text-foreground">
          Submitting is completely anonymous. If logged in, entries will sync to your dashboard where you can manage them.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="md:col-span-2 space-y-4">
          <Card className="bg-white/80 border-olive">
            <CardHeader>
              <CardTitle className="text-lg">Compensation Details</CardTitle>
              <CardDescription>All monetary values are in INR (Indian Rupee)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                  <div className={`p-3 rounded-lg border text-sm text-center ${
                    message.includes("successfully") 
                      ? "bg-sage/10 border-sage/20 text-muted-foreground"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}>
                    {message}
                  </div>
                )}

                {/* Company Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Company</label>
                  <Input
                    type="text"
                    placeholder="e.g. Google, Amazon, Flipkart"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className={errors.company ? "border-rose-500/50 bg-white" : "bg-white"}
                  />
                  {errors.company && <p className="text-xs text-rose-500">{errors.company}</p>}
                </div>

                {/* Role and Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</label>
                    <Select value={role} onChange={(e) => setRole(e.target.value)}>
                      {roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Level</label>
                    <Input
                      type="text"
                      placeholder="e.g. L4, SDE-2, Senior"
                      value={level}
                      onChange={(e) => setLevel(e.target.value)}
                      className={errors.level ? "border-rose-500/50" : ""}
                    />
                    {errors.level && <p className="text-xs text-rose-500">{errors.level}</p>}
                  </div>
                </div>

                {/* Location and YOE */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</label>
                    <Select value={location} onChange={(e) => setLocation(e.target.value)}>
                      {locations.map((loc) => (
                        <option key={loc} value={loc}>{loc}</option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Experience (YOE)</label>
                    <Input
                      type="number"
                      placeholder="e.g. 5"
                      value={yoe}
                      onChange={(e) => setYoe(e.target.value)}
                      className={errors.yoe ? "border-rose-500/50" : ""}
                      min="0"
                    />
                    {errors.yoe && <p className="text-xs text-rose-500">{errors.yoe}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Years at Company</label>
                    <Input
                      type="number"
                      placeholder="e.g. 2"
                      value={yoeAtCompany}
                      onChange={(e) => setYoeAtCompany(e.target.value)}
                      className={errors.yoeAtCompany ? "border-rose-500/50" : ""}
                      min="0"
                    />
                    {errors.yoeAtCompany && <p className="text-xs text-rose-500">{errors.yoeAtCompany}</p>}
                  </div>
                </div>

                <hr className="border-olive/50 my-6" />

                {/* Monetary values */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Base Salary</label>
                      {base && <span className="text-[10px] text-muted-foreground">{formatINR(parseFloat(base) || 0)}</span>}
                    </div>
                    <Input
                      type="number"
                      placeholder="Annual Base (e.g. 1800000)"
                      value={base}
                      onChange={(e) => setBase(e.target.value)}
                      className={errors.base ? "border-rose-500/50" : ""}
                      min="0"
                    />
                    {errors.base && <p className="text-xs text-rose-500">{errors.base}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Annual Bonus</label>
                      {bonus && <span className="text-[10px] text-muted-foreground">{formatINR(parseFloat(bonus) || 0)}</span>}
                    </div>
                    <Input
                      type="number"
                      placeholder="Annual Bonus (e.g. 200000)"
                      value={bonus}
                      onChange={(e) => setBonus(e.target.value)}
                      className={errors.bonus ? "border-rose-500/50" : ""}
                      min="0"
                    />
                    {errors.bonus && <p className="text-xs text-rose-500">{errors.bonus}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Stock value/yr</label>
                      {stock && <span className="text-[10px] text-muted-foreground">{formatINR(parseFloat(stock) || 0)}</span>}
                    </div>
                    <Input
                      type="number"
                      placeholder="Stock value/yr (e.g. 400000)"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className={errors.stock ? "border-rose-500/50" : ""}
                      min="0"
                    />
                    {errors.stock && <p className="text-xs text-rose-500">{errors.stock}</p>}
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-bronze hover:bg-bronze text-white font-bold mt-4"
                >
                  {loading ? "Submitting..." : "Submit Salary Details"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive calculations and widgets */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-background via-background to-bronze/20 border-olive shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-bronze" /> Calculations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pt-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Total Compensation</span>
                <div className="text-3xl font-extrabold text-bronze bg-gradient-to-r from-bronze to-desert bg-clip-text text-transparent mt-1">
                  {formatINR(totalCompensation)}
                </div>
              </div>
              
              <div className="space-y-2 text-xs border-t border-olive pt-4 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Base component:</span>
                  <span className="font-semibold text-foreground">
                    {base ? `${Math.round(((parseFloat(base) || 0) / totalCompensation) * 100) || 0}%` : "0%"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Bonus component:</span>
                  <span className="font-semibold text-foreground">
                    {bonus ? `${Math.round(((parseFloat(bonus) || 0) / totalCompensation) * 100) || 0}%` : "0%"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Stock component:</span>
                  <span className="font-semibold text-foreground">
                    {stock ? `${Math.round(((parseFloat(stock) || 0) / totalCompensation) * 100) || 0}%` : "0%"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border-olive text-xs">
            <CardContent className="p-4 flex gap-2 text-muted-foreground">
              <Info className="h-4 w-4 flex-shrink-0 text-bronze mt-0.5" />
              <div>
                <p className="font-medium text-muted-foreground mb-1">Normalization note</p>
                Our server standardizes company names automatically (e.g. &apos;google inc&apos; or &apos;google llc&apos; is stored as &apos;Google&apos;) to keep database collections tidy.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
