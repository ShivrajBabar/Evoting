
// Geographical data for dropdown selections across forms

// States
export const states = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"];

// Districts by state
export const allDistricts: Record<string, string[]> = {
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi"],
  "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"]
};

// Lok Sabha constituencies by district
export const allLoksabhas: Record<string, string[]> = {
  "Mumbai": ["Mumbai North", "Mumbai South", "Mumbai North East"],
  "Delhi": ["East Delhi", "New Delhi", "North Delhi"],
  "Bangalore": ["Bangalore Central", "Bangalore North", "Bangalore South"],
  "Chennai": ["Chennai Central", "Chennai North", "Chennai South"],
  "Pune": ["Pune", "Baramati", "Maval"],
  "Nagpur": ["Nagpur", "Ramtek"],
  "Thane": ["Thane", "Kalyan"],
  "Central Delhi": ["New Delhi"],
  "East Delhi": ["East Delhi"],
  "New Delhi": ["New Delhi"],
  "North Delhi": ["North Delhi", "Chandni Chowk"],
  "Mysore": ["Mysore"],
  "Hubli": ["Dharwad"],
  "Mangalore": ["Dakshina Kannada"],
  "Coimbatore": ["Coimbatore"],
  "Madurai": ["Madurai"],
  "Salem": ["Salem"]
};

// Vidhan Sabha constituencies by Lok Sabha
export const allVidhansabhas: Record<string, string[]> = {
  "Mumbai North": ["Borivali", "Dahisar", "Kandivali East"],
  "Mumbai South": ["Worli", "Byculla", "Malabar Hill"],
  "Mumbai North East": ["Mulund", "Vikhroli", "Ghatkopar"],
  "East Delhi": ["Preet Vihar", "Vishwas Nagar", "Laxmi Nagar"],
  "New Delhi": ["New Delhi", "Karol Bagh", "Delhi Cantonment"],
  "North Delhi": ["Model Town", "Sadar Bazar", "Chandni Chowk"],
  "Bangalore Central": ["Shivajinagar", "Shantinagar", "Gandhinagar"],
  "Bangalore North": ["Malleshwaram", "Hebbal", "Yeshwantpur"],
  "Bangalore South": ["Basavanagudi", "Jayanagar", "BTM Layout"],
  "Chennai Central": ["Thousand Lights", "Harbour", "Chepauk-Triplicane"],
  "Chennai North": ["Royapuram", "Perambur", "Kolathur"],
  "Chennai South": ["Mylapore", "Velachery", "Saidapet"],
  "Pune": ["Kothrud", "Shivajinagar", "Hadapsar"],
  "Baramati": ["Baramati", "Indapur", "Daund"],
  "Maval": ["Pimpri", "Chinchwad", "Maval"],
  "Nagpur": ["Nagpur East", "Nagpur West", "Nagpur South"],
  "Ramtek": ["Ramtek", "Kamthi", "Umred"],
  "Thane": ["Thane", "Kopri-Pachpakhadi", "Ovala-Majiwada"],
  "Kalyan": ["Kalyan West", "Kalyan East", "Dombivli"]
};

// Local bodies by Vidhan Sabha
export const allLocalBodies: Record<string, string[]> = {
  "Borivali": ["Borivali Municipal Corp", "Borivali Gram Panchayat"],
  "Dahisar": ["Dahisar Municipal Corp", "Dahisar Gram Panchayat"],
  "Kandivali East": ["Kandivali Municipal Corp", "Kandivali Gram Panchayat"],
  "Worli": ["Worli Municipal Corp"],
  "Byculla": ["Byculla Municipal Corp"],
  "Malabar Hill": ["Malabar Hill Municipal Corp"],
  "Preet Vihar": ["Preet Vihar Municipal Corp"],
  "Vishwas Nagar": ["Vishwas Nagar Municipal Corp"],
  "Laxmi Nagar": ["Laxmi Nagar Municipal Corp"],
  "Shivajinagar": ["Shivajinagar Municipal Corp"],
  "Shantinagar": ["Shantinagar Municipal Corp"],
  "Gandhinagar": ["Gandhinagar Municipal Corp"],
  "Thousand Lights": ["Chennai Municipal Corp Zone 5"],
  "Harbour": ["Chennai Municipal Corp Zone 1"],
  "Chepauk-Triplicane": ["Chennai Municipal Corp Zone 6"]
};

// Wards by local body
export const allWards: Record<string, string[]> = {
  "Borivali Municipal Corp": ["Ward 1", "Ward 2", "Ward 3"],
  "Dahisar Municipal Corp": ["Ward 4", "Ward 5", "Ward 6"],
  "Kandivali Municipal Corp": ["Ward 7", "Ward 8", "Ward 9"],
  "Worli Municipal Corp": ["Ward A", "Ward B", "Ward C"],
  "Byculla Municipal Corp": ["Ward D", "Ward E", "Ward F"],
  "Malabar Hill Municipal Corp": ["Ward G", "Ward H", "Ward I"],
  "Preet Vihar Municipal Corp": ["Ward 10", "Ward 11", "Ward 12"],
  "Vishwas Nagar Municipal Corp": ["Ward 13", "Ward 14", "Ward 15"],
  "Laxmi Nagar Municipal Corp": ["Ward 16", "Ward 17", "Ward 18"],
  "Shivajinagar Municipal Corp": ["Ward X", "Ward Y", "Ward Z"],
  "Shantinagar Municipal Corp": ["Ward P", "Ward Q", "Ward R"],
  "Gandhinagar Municipal Corp": ["Ward M", "Ward N", "Ward O"],
  "Chennai Municipal Corp Zone 5": ["Ward 101", "Ward 102", "Ward 103"],
  "Chennai Municipal Corp Zone 1": ["Ward 104", "Ward 105", "Ward 106"],
  "Chennai Municipal Corp Zone 6": ["Ward 107", "Ward 108", "Ward 109"]
};

// Booths by ward
export const allBooths: Record<string, string[]> = {
  "Ward 1": ["Booth #101", "Booth #102", "Booth #103"],
  "Ward 2": ["Booth #104", "Booth #105", "Booth #106"],
  "Ward 3": ["Booth #107", "Booth #108", "Booth #109"],
  "Ward A": ["Booth #201", "Booth #202", "Booth #203"],
  "Ward B": ["Booth #204", "Booth #205", "Booth #206"],
  "Ward C": ["Booth #207", "Booth #208", "Booth #209"],
  "Ward 10": ["Booth #301", "Booth #302", "Booth #303"],
  "Ward 11": ["Booth #304", "Booth #305", "Booth #306"],
  "Ward 12": ["Booth #307", "Booth #308", "Booth #309"],
  "Ward X": ["Booth #401", "Booth #402", "Booth #403"],
  "Ward Y": ["Booth #404", "Booth #405", "Booth #406"],
  "Ward Z": ["Booth #407", "Booth #408", "Booth #409"],
  "Ward 101": ["Booth #501", "Booth #502", "Booth #503"],
  "Ward 102": ["Booth #504", "Booth #505", "Booth #506"],
  "Ward 103": ["Booth #507", "Booth #508", "Booth #509"]
};

// Function to get predefined options by key and parent value
export const getOptionsForDropdown = (
  optionsMap: Record<string, string[]>,
  parentValue: string
): string[] => {
  return optionsMap[parentValue] || [];
};

// Available election types
export const electionTypes = [
  "Lok Sabha Elections 2025",
  "Vidhan Sabha Elections 2024",
  "Municipal Elections 2024",
  "Panchayat Elections 2024"
];

// Party options
export const politicalParties = [
  "Democratic Party",
  "Progressive Alliance",
  "National Front",
  "People's Party",
  "Regional Development Party",
  "United Workers Party",
  "Socialist Alliance",
  "Independent"
];
