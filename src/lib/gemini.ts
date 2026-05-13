import { GoogleGenAI } from '@google/genai';
import { PDFDocument } from 'pdf-lib';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ExtractedRoute {
  routeName: string;
  routeCode: string;
  stops: string[];
  distances: number[];
  farePerKm: number;
  minFare: number;
}

const prompt = `You are an expert data extractor. Look at the provided document (Image or PDF) containing bus fare tables in Bengali. There might be multiple routes in the document (e.g., one per page or multiple on a page).
Extract ALL route information strictly according to this JSON schema as a JSON ARRAY:
[
  {
    "routeName": "Name of the bus route (e.g., 'ধউর হতে মদনপুর'). Do NOT include words like 'নং', 'রুট নং', or 'বাস নং' in the name.",
    "routeCode": "The route code (e.g., 'এ-৩৬২')",
    "stops": ["array of stop names in order"],
    "distances": ["cumulative numerical distances in km from the origin for each stop corresponding to the stops array. e.g., [0, 5.1, 8.6, ...]"],
    "farePerKm": 2.53,
    "minFare": 10.0
  }
]

CRITICAL RULES FOR DISTANCES AND FARES:
1. Pay EXTREME attention to the distances (km) associated with each stop. The distances MUST be cumulative, starting exactly at 0.0 for the first stop.
2. If the document provides list of stops and cumulative distances next to them (e.g., 'ধউর 0.0', 'আব্দুল্লাহপুর 5.1'), extract exactly those distances in the same order.
3. If the document provides cumulative fares (vara) instead of distances, calculate the cumulative distance by dividing the cumulative fare by the farePerKm.
4. If point-to-point distances are provided instead of cumulative, sum them up as you go.
5. Be VERY CAREFUL not to miss any stops. The number of stops MUST exactly match the number of distances.
6. The Fare Per KM is usually 2.53 for normal, or 2.45 for minibus. Ensure you capture the correct rate.
7. Return ONLY a valid JSON array. If there are no routes found on this page, return an empty array [].`;

async function getBase64Data(fileOrBlob: File | Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(fileOrBlob);
  });
}

async function extractSingleDoc(base64Data: string, mimeType: string): Promise<ExtractedRoute[]> {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: [
      {
        role: 'user',
        parts: [
          { text: prompt },
          { inlineData: { mimeType, data: base64Data } }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      temperature: 0.1
    }
  });

  const text = response.text;
  if (!text) return [];

  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [data];
  } catch (e) {
    return [];
  }
}

export async function extractRoutesFromDocument(
  file: File,
  onProgress?: (msg: string) => void,
  onRoutesExtracted?: (routes: ExtractedRoute[]) => Promise<void>
): Promise<ExtractedRoute[]> {
  if (file.type === 'application/pdf') {
    if (onProgress) onProgress('Reading PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const numPages = pdfDoc.getPageCount();
    
    let allRoutes: ExtractedRoute[] = [];
    
    for (let i = 0; i < numPages; i++) {
      if (onProgress) onProgress(`Parsing page ${i + 1} of ${numPages}...`);
      
      const newPdf = await PDFDocument.create();
      const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
      newPdf.addPage(copiedPage);
      
      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const base64Data = await getBase64Data(blob);
      
      const routes = await extractSingleDoc(base64Data, 'application/pdf');
      
      if (onRoutesExtracted && routes.length > 0) {
        if (onProgress) onProgress(`Saving ${routes.length} routes from page ${i + 1}...`);
        await onRoutesExtracted(routes);
      }
      
      allRoutes = [...allRoutes, ...routes];
    }
    
    if (onProgress) onProgress('Finalizing data...');
    return allRoutes;

  } else {
    // If it's an image
    if (onProgress) onProgress('Parsing image...');
    const base64Data = await getBase64Data(file);
    const routes = await extractSingleDoc(base64Data, file.type);
    
    if (onRoutesExtracted && routes.length > 0) {
      if (onProgress) onProgress(`Saving ${routes.length} routes from image...`);
      await onRoutesExtracted(routes);
    }
    
    if (onProgress) onProgress('Finalizing data...');
    return routes;
  }
}
