/**
 * Card Component System - Draggable components for card customization
 */

export type ComponentType = 
  | 'text' 
  | 'heading' 
  | 'image' 
  | 'contact' 
  | 'social' 
  | 'qr' 
  | 'divider'
  | 'custom';

export interface CardComponent {
  id: string;
  type: ComponentType;
  content: ComponentContent;
  position?: { x: number; y: number };
  style?: ComponentStyle;
}

export interface ComponentContent {
  // Text/Heading
  text?: string;
  
  // Image
  imageUrl?: string;
  
  // Contact info
  label?: string;
  value?: string;
  icon?: string;
  
  // Custom
  customContent?: any;
}

export interface ComponentStyle {
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | '600' | '700';
  color?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right';
  padding?: number;
  margin?: number;
}

/**
 * Extract draggable components from LinkedIn profile data
 */
export function extractComponentsFromProfile(profile: {
  name?: string;
  headline?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  city?: string;
  email?: string;
  phone?: string;
  website?: string;
  photoUrl?: string | null;
  character?: string;
  publications?: Array<{
    title: string;
    publisher?: string;
    date?: string;
    description?: string;
    url?: string;
  }>;
}): CardComponent[] {
  const components: CardComponent[] = [];

  // Character (shown first if available) - should be 3 keywords from AI summary
  if (profile.character) {
    // Character is already summarized to 3 keywords by AI in the API response
    // Just use it directly (format: "keyword1, keyword2, keyword3")
    components.push({
      id: 'character',
      type: 'text',
      content: { text: profile.character, label: 'CHARACTER' },
      style: { fontSize: 14, color: '#737373' },
    });
  }

  // Name (Heading) with "NAME" label
  if (profile.name) {
    components.push({
      id: 'name',
      type: 'heading',
      content: { text: profile.name, label: 'NAME' },
      style: { fontSize: 24, fontWeight: 'bold' },
    });
  }

  // Job Title (if separate from headline)
  if (profile.jobTitle) {
    components.push({
      id: 'jobTitle',
      type: 'text',
      content: { text: profile.jobTitle, label: 'Job Title' },
      style: { fontSize: 14, fontWeight: '600' },
    });
  }

  // Headline as "ABOUT ME"
  if (profile.headline) {
    components.push({
      id: 'headline',
      type: 'text',
      content: { text: profile.headline, label: 'ABOUT ME' },
      style: { fontSize: 14, color: '#737373' },
    });
  }

  // Company
  if (profile.company) {
    components.push({
      id: 'company',
      type: 'text',
      content: { text: profile.company, label: 'COMPANY' },
      style: { fontSize: 16, fontWeight: '600' },
    });
  }

  // Location: Format as "City, Country"
  // Parse location string to extract city and country
  let locationDisplay = '';
  if (profile.location) {
    // If location contains a comma, it's likely "City, Country" format
    if (profile.location.includes(',')) {
      const parts = profile.location.split(',').map(s => s.trim());
      const city = parts[0];
      const country = parts.slice(1).join(', '); // Handle cases like "City, State, Country"
      locationDisplay = country ? `${city}, ${country}` : city;
    } else {
      // If no comma, check if we have city separately
      if (profile.city && profile.city !== profile.location) {
        locationDisplay = `${profile.city}, ${profile.location}`;
      } else {
        locationDisplay = profile.location;
      }
    }
  } else if (profile.city) {
    locationDisplay = profile.city;
  }
  
  if (locationDisplay) {
    components.push({
      id: 'location',
      type: 'contact',
      content: { label: 'LOCATION', value: locationDisplay, icon: 'location' },
    });
  }

  // Email
  if (profile.email) {
    components.push({
      id: 'email',
      type: 'contact',
      content: { label: 'Email', value: profile.email, icon: 'mail' },
    });
  }

  // Phone
  if (profile.phone) {
    components.push({
      id: 'phone',
      type: 'contact',
      content: { label: 'Phone', value: profile.phone, icon: 'call' },
    });
  }

  // Website
  if (profile.website) {
    components.push({
      id: 'website',
      type: 'contact',
      content: { label: 'Website', value: profile.website, icon: 'link' },
    });
  }

  // Photo
  if (profile.photoUrl) {
    components.push({
      id: 'photo',
      type: 'image',
      content: { imageUrl: profile.photoUrl },
    });
  }

  // Publications (posts/articles)
  if (profile.publications && profile.publications.length > 0) {
    // Add up to 3 publications as separate components
    profile.publications.slice(0, 3).forEach((pub, index) => {
      if (pub.title) {
        components.push({
          id: `publication-${index}`,
          type: 'text',
          content: { 
            text: pub.title,
            label: pub.publisher ? `📄 ${pub.publisher}` : '📄 Publication'
          },
          style: { fontSize: 14, color: '#737373' },
        });
      }
    });
  }

  // Divider
  components.push({
    id: 'divider',
    type: 'divider',
    content: {},
  });

  return components;
}

