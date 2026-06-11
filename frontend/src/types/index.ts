export interface Match {
  id: string;
  match_date: string;
  stage: string;
  group_name: string;
  match_number: number;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  home_team: Team;
  away_team: Team;
  stadium: Stadium;
  ticket_categories: TicketCategory[];
}

export interface Team {
  id: string;
  name: string;
  country_code: string;
  flag_url?: string;
}

export interface Stadium {
  id: string;
  name: string;
  city: string;
  country: string;
  capacity: number;
  image_url?: string;
}

export interface TicketCategory {
  id: string;
  name: string;
  description?: string;
  price: number;
  available_seats: number;
  total_seats: number;
  section: string;
  benefits?: string[];
}

export interface Booking {
  id: string;
  booking_reference: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'refunded';
  total_amount: number;
  currency: string;
  payment_method?: string;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  items?: BookingItem[];
}

export interface BookingItem {
  id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  category: { id: string; name: string; section: string };
  match: { id: string; match_date: string; stage: string; home_team: string; away_team: string; stadium: string };
}

export interface Ticket {
  id: string;
  ticket_number: string;
  qr_code: string;
  seat_number: string;
  is_used: boolean;
  category_name: string;
  section: string;
  match_date: string;
  home_team: string;
  away_team: string;
  stadium: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}
