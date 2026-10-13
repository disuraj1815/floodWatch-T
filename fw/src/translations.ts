import { Language } from './types';

export const translations: Record<Language, Record<string, string>> = {
  en: {
    appName: 'FloodWatch',
    subtitle: 'AI-Assisted Satellite Flood Mapping & Infrastructure Impact Assessment',
    hackathonTrack: 'Multimodal AI Hackathon 2026 — Track B',

    // Nav
    dashboard: 'Dashboard',
    floodAnalysis: 'Flood Analysis',
    satelliteObservations: 'Satellite Observations',
    infrastructureImpact: 'Infrastructure Impact',
    roadConnectivity: 'Road Connectivity',
    situationReport: 'Situation Report',
    validation: 'EMSR927 Validation',
    dataSources: 'Data Sources & Limits',
    systemDiagnostics: 'System Diagnostics',

    // Common
    statusConnected: 'Connected',
    statusNotConnected: 'Not Connected',
    statusOffline: 'Offline',
    startAnalysis: 'New Analysis',
    reset: 'Reset',
    loading: 'Loading...',
    error: 'Error',
    search: 'Search location...',
    coordinates: 'Coordinates',
    aoiSelection: 'Area of Interest (AOI)',
    viewMap: 'View Interactive Map',
    backendStatus: 'Backend Status',

    // Footer / Attributions
    copernicusNotice: 'Contains modified Copernicus Sentinel data 2026.',
    demNotice: 'Produced using Copernicus WorldDEM-30 © DLR e.V. 2010–2014 and © Airbus Defence and Space GmbH 2014–2018 provided under COPERNICUS by the European Union and ESA; all rights reserved.',
    osmNotice: '© OpenStreetMap contributors.',
  },
  hi: {
    appName: 'फ्लडवॉच (FloodWatch)',
    subtitle: 'AI-सहायता प्राप्त उपग्रह बाढ़ मैपिंग और बुनियादी ढांचा प्रभाव आकलन',
    hackathonTrack: 'मल्टीमॉडल AI हैकाथॉन 2026 — ट्रैक B',

    dashboard: 'डैशबोर्ड',
    floodAnalysis: 'बाढ़ विश्लेषण',
    satelliteObservations: 'उपग्रह अवलोकन',
    infrastructureImpact: 'बुनियादी ढांचा प्रभाव',
    roadConnectivity: 'सड़क कनेक्टिविटी',
    situationReport: 'स्थिति रिपोर्ट',
    validation: 'EMSR927 सत्यापन',
    dataSources: 'डेटा स्रोत और सीमाएं',
    systemDiagnostics: 'सिस्टम डायग्नोस्टिक्स',

    statusConnected: 'जुड़ा हुआ',
    statusNotConnected: 'कनेक्टेड नहीं है',
    statusOffline: 'ऑफ़लाइन',
    startAnalysis: 'नया विश्लेषण',
    reset: 'रीसेट',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    search: 'स्थान खोजें...',
    coordinates: 'निर्देशांक',
    aoiSelection: 'रुचि का क्षेत्र (AOI)',
    viewMap: 'इंटरैक्टिव मानचित्र देखें',
    backendStatus: 'बैकएंड स्थिति',

    copernicusNotice: 'इसमें संशोधित कोपरनिकस सेंटिनल डेटा 2026 शामिल है।',
    demNotice: 'कोपरनिकस WorldDEM-30 © DLR e.V. 2010–2014 और © Airbus Defence and Space GmbH 2014–2018 का उपयोग करके निर्मित।',
    osmNotice: '© ओपनस्ट्रीटमैप योगदानकर्ता।',
  },
  ne: {
    appName: 'फ्लडवाच (FloodWatch)',
    subtitle: 'एआई-सहायता प्राप्त उपग्रह बाढी म्यापिङ र पूर्वाधार प्रभाव मूल्यांकन',
    hackathonTrack: 'मल्टीमोडल एआई ह्याकाथन २०२६ — ट्र्याक बी',

    dashboard: 'ड्यासबोर्ड',
    floodAnalysis: 'बाढी विश्लेषण',
    satelliteObservations: 'उपग्रह अवलोकन',
    infrastructureImpact: 'पूर्वाधार प्रभाव',
    roadConnectivity: 'सडक जडान',
    situationReport: 'स्थिति रिपोर्ट',
    validation: 'EMSR927 प्रमाणीकरण',
    dataSources: 'डेटा स्रोत र सीमाहरू',
    systemDiagnostics: 'प्रणाली निदान',

    statusConnected: 'जडान गरिएको',
    statusNotConnected: 'जडान भएको छैन',
    statusOffline: 'अफलाइन',
    startAnalysis: 'नयाँ विश्लेषण',
    reset: 'रिसेट',
    loading: 'लोड हुँदैछ...',
    error: 'त्रुटि',
    search: 'स्थान खोज्नुहोस्...',
    coordinates: 'निर्देशांक',
    aoiSelection: 'चासोको क्षेत्र (AOI)',
    viewMap: 'अन्तरक्रियात्मक नक्सा हेर्नुहोस्',
    backendStatus: 'ब्याकएन्ड स्थिति',

    copernicusNotice: 'संशोधित कोपर्निकस सेन्टिनेल डाटा २०२६ समावेश छ।',
    demNotice: 'कोपर्निकस WorldDEM-30 © DLR e.V. 2010–2014 र © Airbus Defence and Space GmbH 2014–2018 प्रयोग गरी उत्पादित।',
    osmNotice: '© ओपनस्ट्रिटम्याप योगदानकर्ताहरू।',
  }
};
