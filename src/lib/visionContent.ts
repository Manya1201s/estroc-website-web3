/**
 * Copy for the Computer Vision page, in one place so the claims can be
 * reviewed together. Everything describes what ESTROC can build — not
 * delivered client work. Figures shown in mockups are illustrative.
 */

export interface VisionCapability {
  id: "detection" | "inspection" | "ocr" | "video" | "recognition" | "custom";
  title: string;
  copy: string;
  example: string;
  /** Where on this page the example can be seen in context. */
  related: { label: string; target: string };
}

export const visionCapabilities: VisionCapability[] = [
  {
    id: "detection",
    title: "Object Detection & Tracking",
    copy: "Identify and track objects, people, vehicles or products.",
    example: "Count pallets and forklifts across a loading dock, and follow each one as it moves.",
    related: { label: "See VisionTrack", target: "project-track" },
  },
  {
    id: "inspection",
    title: "Industrial Quality Inspection",
    copy: "Detect defects, missing components and visual anomalies.",
    example: "Flag scratches and missing parts on a circuit board before it leaves the line.",
    related: { label: "See VisionInspect", target: "project-inspect" },
  },
  {
    id: "ocr",
    title: "OCR & Document Intelligence",
    copy: "Extract useful information from scanned documents and images.",
    example: "Read invoice numbers, dates and totals straight into an accounting system.",
    related: { label: "See DocuVision", target: "project-docu" },
  },
  {
    id: "video",
    title: "Video Analytics",
    copy: "Turn video streams into counts, events, alerts and insights.",
    example: "Alert the operations team when a vehicle enters a restricted zone.",
    related: { label: "See VisionTrack", target: "project-track" },
  },
  {
    id: "recognition",
    title: "Image Recognition & Visual Search",
    copy: "Classify images, find similar products and recognize visual patterns.",
    example: "Let shoppers find a product from a photo, and keep catalogue images correctly tagged.",
    related: { label: "Try the demo", target: "demo" },
  },
  {
    id: "custom",
    title: "Custom Vision AI",
    copy: "Build tailored visual AI workflows for specific business needs.",
    example: "Combine detection, business rules and alerts into one workflow designed around your site.",
    related: { label: "See project options", target: "build-options" },
  },
];

export const visionUseCases: { id: string; name: string; example: string }[] = [
  { id: "manufacturing", name: "Manufacturing", example: "Spot defects and missing parts on the production line." },
  { id: "retail", name: "Retail & E-commerce", example: "Visual product search and shelf monitoring." },
  { id: "logistics", name: "Logistics & Warehousing", example: "Count pallets and track movement across docks." },
  { id: "healthcare", name: "Healthcare Imaging", example: "Annotation and analysis tools that support specialists." },
  { id: "agriculture", name: "Agriculture", example: "Monitor crop condition from drone imagery." },
  { id: "infrastructure", name: "Infrastructure & Energy", example: "Review drone inspections of lines, panels and assets." },
];

export const visionOptions: { title: string; copy: string; message: string }[] = [
  { title: "Proof of Concept", copy: "Test the feasibility of a visual AI idea.", message: "I'd like to explore a computer vision proof of concept." },
  { title: "Custom Vision Application", copy: "Build an application around a specific visual workflow.", message: "I'd like to discuss a custom computer vision application." },
  { title: "Vision API Integration", copy: "Add visual intelligence to an existing product.", message: "I'd like to add computer vision to an existing product." },
  { title: "Inspection & Analytics Dashboard", copy: "Turn image and video results into useful operational views.", message: "I'd like to discuss a vision inspection or analytics dashboard." },
];
