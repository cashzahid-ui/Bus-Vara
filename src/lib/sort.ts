export function parseBengaliNumber(bengaliNumber: string): { prefix: string; num: number; suffix: string } {
  const bengaliToEnglish: { [key: string]: string } = {
    '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4',
    '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9'
  };
  
  let englishNumber = '';
  for (const char of bengaliNumber) {
    if (bengaliToEnglish[char]) {
      englishNumber += bengaliToEnglish[char];
    } else {
      englishNumber += char;
    }
  }
  
  const match = englishNumber.match(/^([^0-9]*)([0-9]+)(.*)$/);
  if (match) {
    return {
      prefix: match[1],
      num: parseInt(match[2], 10),
      suffix: match[3]
    };
  }
  
  return { prefix: englishNumber, num: 0, suffix: '' };
}

export function sortRoutes<T extends { routeCode: string }>(routes: T[]): T[] {
  return [...routes].sort((a, b) => {
    const parsedA = parseBengaliNumber(a.routeCode || '');
    const parsedB = parseBengaliNumber(b.routeCode || '');
    
    // Sort by prefix alphabetically first
    const prefixCompare = parsedA.prefix.localeCompare(parsedB.prefix, 'bn');
    if (prefixCompare !== 0) return prefixCompare;
    
    // Then sort by numeric value
    if (parsedA.num !== parsedB.num) {
      return parsedA.num - parsedB.num;
    }
    
    // Then sort by suffix if needed
    return parsedA.suffix.localeCompare(parsedB.suffix, 'bn');
  });
}
