/* Ahmedabad Airport Cab — offline India location index.
   Used by the From / To autocomplete on index.html and booking-results.html.
   No network required. Types: state | ut | district | city | airport */
(function () {
  var S = 'state', U = 'ut', D = 'district', C = 'city', A = 'airport';

  // ---- States & Union Territories -------------------------------------
  var STATES = 'Andhra Pradesh|Arunachal Pradesh|Assam|Bihar|Chhattisgarh|Goa|Gujarat|Haryana|Himachal Pradesh|Jharkhand|Karnataka|Kerala|Madhya Pradesh|Maharashtra|Manipur|Meghalaya|Mizoram|Nagaland|Odisha|Punjab|Rajasthan|Sikkim|Tamil Nadu|Telangana|Tripura|Uttar Pradesh|Uttarakhand|West Bengal';
  var UTS = 'Andaman and Nicobar Islands|Chandigarh|Dadra and Nagar Haveli and Daman and Diu|Delhi|Jammu and Kashmir|Ladakh|Lakshadweep|Puducherry';

  // ---- Districts by state ---------------------------------------------
  var DISTRICTS = {
    'Andhra Pradesh': 'Alluri Sitharama Raju|Anakapalli|Anantapur|Annamayya|Bapatla|Chittoor|Dr. B.R. Ambedkar Konaseema|East Godavari|Eluru|Guntur|Kakinada|Krishna|Kurnool|Nandyal|NTR|Palnadu|Parvathipuram Manyam|Prakasam|Nellore|Sri Sathya Sai|Srikakulam|Tirupati|Visakhapatnam|Vizianagaram|West Godavari|YSR Kadapa',
    'Arunachal Pradesh': 'Anjaw|Changlang|Dibang Valley|East Kameng|East Siang|Kamle|Kra Daadi|Kurung Kumey|Lepa Rada|Lohit|Longding|Lower Dibang Valley|Lower Siang|Lower Subansiri|Namsai|Pakke-Kessang|Papum Pare|Shi Yomi|Siang|Tawang|Tirap|Upper Siang|Upper Subansiri|West Kameng|West Siang',
    'Assam': 'Bajali|Baksa|Barpeta|Biswanath|Bongaigaon|Cachar|Charaideo|Chirang|Darrang|Dhemaji|Dhubri|Dibrugarh|Dima Hasao|Goalpara|Golaghat|Hailakandi|Hojai|Jorhat|Kamrup|Kamrup Metropolitan|Karbi Anglong|Karimganj|Kokrajhar|Lakhimpur|Majuli|Morigaon|Nagaon|Nalbari|Sivasagar|Sonitpur|South Salmara-Mankachar|Tamulpur|Tinsukia|Udalguri|West Karbi Anglong',
    'Bihar': 'Araria|Arwal|Aurangabad|Banka|Begusarai|Bhagalpur|Bhojpur|Buxar|Darbhanga|East Champaran|Gaya|Gopalganj|Jamui|Jehanabad|Kaimur|Katihar|Khagaria|Kishanganj|Lakhisarai|Madhepura|Madhubani|Munger|Muzaffarpur|Nalanda|Nawada|Patna|Purnia|Rohtas|Saharsa|Samastipur|Saran|Sheikhpura|Sheohar|Sitamarhi|Siwan|Supaul|Vaishali|West Champaran',
    'Chhattisgarh': 'Balod|Baloda Bazar|Balrampur|Bastar|Bemetara|Bijapur|Bilaspur|Dantewada|Dhamtari|Durg|Gariaband|Gaurela-Pendra-Marwahi|Janjgir-Champa|Jashpur|Kabirdham|Kanker|Khairagarh|Kondagaon|Korba|Koriya|Mahasamund|Manendragarh|Mohla-Manpur|Mungeli|Narayanpur|Raigarh|Raipur|Rajnandgaon|Sakti|Sarangarh-Bilaigarh|Sukma|Surajpur|Surguja',
    'Goa': 'North Goa|South Goa',
    'Gujarat': 'Ahmedabad|Amreli|Anand|Aravalli|Banaskantha|Bharuch|Bhavnagar|Botad|Chhota Udaipur|Dahod|Dang|Devbhoomi Dwarka|Gandhinagar|Gir Somnath|Jamnagar|Junagadh|Kheda|Kutch|Mahisagar|Mehsana|Morbi|Narmada|Navsari|Panchmahal|Patan|Porbandar|Rajkot|Sabarkantha|Surat|Surendranagar|Tapi|Vadodara|Valsad',
    'Haryana': 'Ambala|Bhiwani|Charkhi Dadri|Faridabad|Fatehabad|Gurugram|Hisar|Jhajjar|Jind|Kaithal|Karnal|Kurukshetra|Mahendragarh|Nuh|Palwal|Panchkula|Panipat|Rewari|Rohtak|Sirsa|Sonipat|Yamunanagar',
    'Himachal Pradesh': 'Bilaspur|Chamba|Hamirpur|Kangra|Kinnaur|Kullu|Lahaul and Spiti|Mandi|Shimla|Sirmaur|Solan|Una',
    'Jharkhand': 'Bokaro|Chatra|Deoghar|Dhanbad|Dumka|East Singhbhum|Garhwa|Giridih|Godda|Gumla|Hazaribagh|Jamtara|Khunti|Koderma|Latehar|Lohardaga|Pakur|Palamu|Ramgarh|Ranchi|Sahibganj|Seraikela-Kharsawan|Simdega|West Singhbhum',
    'Karnataka': 'Bagalkot|Ballari|Belagavi|Bengaluru Rural|Bengaluru Urban|Bidar|Chamarajanagar|Chikkaballapur|Chikkamagaluru|Chitradurga|Dakshina Kannada|Davanagere|Dharwad|Gadag|Hassan|Haveri|Kalaburagi|Kodagu|Kolar|Koppal|Mandya|Mysuru|Raichur|Ramanagara|Shivamogga|Tumakuru|Udupi|Uttara Kannada|Vijayanagara|Vijayapura|Yadgir',
    'Kerala': 'Alappuzha|Ernakulam|Idukki|Kannur|Kasaragod|Kollam|Kottayam|Kozhikode|Malappuram|Palakkad|Pathanamthitta|Thiruvananthapuram|Thrissur|Wayanad',
    'Madhya Pradesh': 'Agar Malwa|Alirajpur|Anuppur|Ashoknagar|Balaghat|Barwani|Betul|Bhind|Bhopal|Burhanpur|Chhatarpur|Chhindwara|Damoh|Datia|Dewas|Dhar|Dindori|Guna|Gwalior|Harda|Indore|Jabalpur|Jhabua|Katni|Khandwa|Khargone|Maihar|Mandla|Mandsaur|Mauganj|Morena|Narmadapuram|Narsinghpur|Neemuch|Niwari|Pandhurna|Panna|Raisen|Rajgarh|Ratlam|Rewa|Sagar|Satna|Sehore|Seoni|Shahdol|Shajapur|Sheopur|Shivpuri|Sidhi|Singrauli|Tikamgarh|Ujjain|Umaria|Vidisha',
    'Maharashtra': 'Ahilyanagar|Akola|Amravati|Beed|Bhandara|Buldhana|Chandrapur|Chhatrapati Sambhajinagar|Dhule|Gadchiroli|Gondia|Hingoli|Jalgaon|Jalna|Kolhapur|Latur|Mumbai City|Mumbai Suburban|Nagpur|Nanded|Nandurbar|Nashik|Dharashiv|Palghar|Parbhani|Pune|Raigad|Ratnagiri|Sangli|Satara|Sindhudurg|Solapur|Thane|Wardha|Washim|Yavatmal',
    'Manipur': 'Bishnupur|Chandel|Churachandpur|Imphal East|Imphal West|Jiribam|Kakching|Kamjong|Kangpokpi|Noney|Pherzawl|Senapati|Tamenglong|Tengnoupal|Thoubal|Ukhrul',
    'Meghalaya': 'East Garo Hills|East Jaintia Hills|East Khasi Hills|North Garo Hills|Ri Bhoi|South Garo Hills|South West Garo Hills|South West Khasi Hills|West Garo Hills|West Jaintia Hills|West Khasi Hills',
    'Mizoram': 'Aizawl|Champhai|Hnahthial|Khawzawl|Kolasib|Lawngtlai|Lunglei|Mamit|Saiha|Saitual|Serchhip',
    'Nagaland': 'Chumoukedima|Dimapur|Kiphire|Kohima|Longleng|Mokokchung|Mon|Niuland|Noklak|Peren|Phek|Shamator|Tseminyu|Tuensang|Wokha|Zunheboto',
    'Odisha': 'Angul|Balangir|Balasore|Bargarh|Bhadrak|Boudh|Cuttack|Deogarh|Dhenkanal|Gajapati|Ganjam|Jagatsinghpur|Jajpur|Jharsuguda|Kalahandi|Kandhamal|Kendrapara|Kendujhar|Khordha|Koraput|Malkangiri|Mayurbhanj|Nabarangpur|Nayagarh|Nuapada|Puri|Rayagada|Sambalpur|Subarnapur|Sundargarh',
    'Punjab': 'Amritsar|Barnala|Bathinda|Faridkot|Fatehgarh Sahib|Fazilka|Ferozepur|Gurdaspur|Hoshiarpur|Jalandhar|Kapurthala|Ludhiana|Malerkotla|Mansa|Moga|Muktsar|Pathankot|Patiala|Rupnagar|Sangrur|Tarn Taran',
    'Rajasthan': 'Ajmer|Alwar|Balotra|Banswara|Baran|Barmer|Beawar|Bharatpur|Bhilwara|Bikaner|Bundi|Chittorgarh|Churu|Dausa|Deeg|Dholpur|Didwana|Dungarpur|Gangapur City|Hanumangarh|Jaipur|Jaisalmer|Jalore|Jhalawar|Jhunjhunu|Jodhpur|Karauli|Khairthal|Kotputli|Kota|Kuchaman|Nagaur|Neem Ka Thana|Pali|Phalodi|Pratapgarh|Rajsamand|Salumbar|Sanchore|Sawai Madhopur|Shahpura|Sikar|Sirohi|Sri Ganganagar|Tonk|Udaipur',
    'Sikkim': 'Gangtok|Gyalshing|Mangan|Namchi|Pakyong|Soreng',
    'Tamil Nadu': 'Ariyalur|Chengalpattu|Chennai|Coimbatore|Cuddalore|Dharmapuri|Dindigul|Erode|Kallakurichi|Kanchipuram|Kanyakumari|Karur|Krishnagiri|Madurai|Mayiladuthurai|Nagapattinam|Namakkal|Nilgiris|Perambalur|Pudukkottai|Ramanathapuram|Ranipet|Salem|Sivaganga|Tenkasi|Thanjavur|Theni|Thoothukudi|Tiruchirappalli|Tirunelveli|Tirupathur|Tiruppur|Tiruvallur|Tiruvannamalai|Tiruvarur|Vellore|Viluppuram|Virudhunagar',
    'Telangana': 'Adilabad|Bhadradri Kothagudem|Hanumakonda|Hyderabad|Jagtial|Jangaon|Jayashankar Bhupalpally|Jogulamba Gadwal|Kamareddy|Karimnagar|Khammam|Komaram Bheem Asifabad|Mahabubabad|Mahabubnagar|Mancherial|Medak|Medchal-Malkajgiri|Mulugu|Nagarkurnool|Nalgonda|Narayanpet|Nirmal|Nizamabad|Peddapalli|Rajanna Sircilla|Rangareddy|Sangareddy|Siddipet|Suryapet|Vikarabad|Wanaparthy|Warangal|Yadadri Bhuvanagiri',
    'Tripura': 'Dhalai|Gomati|Khowai|North Tripura|Sepahijala|South Tripura|Unakoti|West Tripura',
    'Uttar Pradesh': 'Agra|Aligarh|Ambedkar Nagar|Amethi|Amroha|Auraiya|Ayodhya|Azamgarh|Baghpat|Bahraich|Ballia|Balrampur|Banda|Barabanki|Bareilly|Basti|Bhadohi|Bijnor|Budaun|Bulandshahr|Chandauli|Chitrakoot|Deoria|Etah|Etawah|Farrukhabad|Fatehpur|Firozabad|Gautam Buddha Nagar|Ghaziabad|Ghazipur|Gonda|Gorakhpur|Hamirpur|Hapur|Hardoi|Hathras|Jalaun|Jaunpur|Jhansi|Kannauj|Kanpur Dehat|Kanpur Nagar|Kasganj|Kaushambi|Kheri|Kushinagar|Lalitpur|Lucknow|Maharajganj|Mahoba|Mainpuri|Mathura|Mau|Meerut|Mirzapur|Moradabad|Muzaffarnagar|Pilibhit|Pratapgarh|Prayagraj|Raebareli|Rampur|Saharanpur|Sambhal|Sant Kabir Nagar|Shahjahanpur|Shamli|Shrawasti|Siddharthnagar|Sitapur|Sonbhadra|Sultanpur|Unnao|Varanasi',
    'Uttarakhand': 'Almora|Bageshwar|Chamoli|Champawat|Dehradun|Haridwar|Nainital|Pauri Garhwal|Pithoragarh|Rudraprayag|Tehri Garhwal|Udham Singh Nagar|Uttarkashi',
    'West Bengal': 'Alipurduar|Bankura|Birbhum|Cooch Behar|Dakshin Dinajpur|Darjeeling|Hooghly|Howrah|Jalpaiguri|Jhargram|Kalimpong|Kolkata|Malda|Murshidabad|Nadia|North 24 Parganas|Paschim Bardhaman|Paschim Medinipur|Purba Bardhaman|Purba Medinipur|Purulia|South 24 Parganas|Uttar Dinajpur',
    'Delhi': 'Central Delhi|East Delhi|New Delhi|North Delhi|North East Delhi|North West Delhi|Shahdara|South Delhi|South East Delhi|South West Delhi|West Delhi',
    'Jammu and Kashmir': 'Anantnag|Bandipora|Baramulla|Budgam|Doda|Ganderbal|Jammu|Kathua|Kishtwar|Kulgam|Kupwara|Poonch|Pulwama|Rajouri|Ramban|Reasi|Samba|Shopian|Srinagar|Udhampur',
    'Ladakh': 'Kargil|Leh',
    'Puducherry': 'Karaikal|Mahe|Puducherry|Yanam',
    'Andaman and Nicobar Islands': 'Nicobar|North and Middle Andaman|Port Blair|South Andaman',
    'Dadra and Nagar Haveli and Daman and Diu': 'Dadra and Nagar Haveli|Daman|Diu',
    'Chandigarh': 'Chandigarh',
    'Lakshadweep': 'Kavaratti'
  };

  // ---- Cities / towns / tourist & pilgrimage stops ----------------------
  var CITIES = {
    'Gujarat': 'Adalaj|Adipur|Ambaji|Ankleshwar|Anjar|Bahucharaji|Bardoli|Bhachau|Bhuj|Bilimora|Chotila|Dakor|Dahej|Deesa|Dholavira|Dhoraji|Dwarka|Gandhidham|Gir|Godhra|Gondal|Halol|Halvad|Himatnagar|Idar|Jetpur|Kalol|Kadi|Kandla|Kevadiya|Keshod|Khambhat|Lothal|Mandvi|Mehsana|Modasa|Mundra|Nadiad|Nakhatrana|Okha|Palanpur|Palitana|Pavagadh|Petlad|Polo Forest|Radhanpur|Rapar|Salangpur|Sanand|Sasan Gir|Savarkundla|Shamlaji|Sidhpur|Somnath|Statue of Unity|Talaja|Thangadh|Una|Unjha|Upleta|Vallabh Vidyanagar|Vapi|Veraval|Viramgam|Virpur|Wankaner',
    'Rajasthan': 'Abu Road|Balesar|Bhinmal|Falna|Kumbhalgarh|Mandawa|Mount Abu|Nathdwara|Osian|Pushkar|Ramdevra|Ranakpur|Salasar|Sardarshahar|Siwana|Sojat|Khatu Shyam|Bhiwadi|Kishangarh|Makrana|Merta City|Nasirabad|Nokha|Ratangarh|Sumerpur',
    'Maharashtra': 'Alibaug|Ambernath|Badlapur|Bhiwandi|Boisar|Dombivli|Igatpuri|Kalyan|Karjat|Khandala|Khopoli|Lonavala|Mahabaleshwar|Malegaon|Matheran|Mira-Bhayandar|Navi Mumbai|Nerul|Panchgani|Panvel|Pimpri-Chinchwad|Shani Shingnapur|Shirdi|Talegaon|Trimbakeshwar|Ulhasnagar|Vasai-Virar|Virar|Mumbai',
    'Madhya Pradesh': 'Amarkantak|Bhedaghat|Chitrakoot|Itarsi|Khajuraho|Mandu|Maheshwar|Nagda|Omkareshwar|Orchha|Pachmarhi|Pithampur|Sanchi|Shahganj|Thandla|Meghnagar|Petlawad',
    'Uttar Pradesh': 'Greater Noida|Noida|Vrindavan|Kanpur|Ghaziabad|Loni|Modinagar|Sarnath|Renukoot|Naimisharanya',
    'Haryana': 'Bahadurgarh|Gurgaon|Manesar|Pinjore|Sohna',
    'Punjab': 'Anandpur Sahib|Mohali|Zirakpur',
    'Uttarakhand': 'Badrinath|Gangotri|Haldwani|Kedarnath|Mussoorie|Rishikesh|Roorkee|Rudrapur|Yamunotri|Auli|Ranikhet|Kausani',
    'Himachal Pradesh': 'Dalhousie|Dharamshala|Kasauli|Kasol|Manali|McLeod Ganj|Palampur|Parwanoo',
    'Karnataka': 'Bengaluru|Hampi|Hubli|Mangaluru|Whitefield|Electronic City|Gokarna|Coorg',
    'Telangana': 'Secunderabad|Gachibowli|Hitec City|Ramoji Film City',
    'Tamil Nadu': 'Hosur|Kodaikanal|Mahabalipuram|Ooty|Rameswaram|Tiruchendur|Velankanni|Yercaud',
    'Kerala': 'Alleppey|Kochi|Kovalam|Munnar|Thekkady|Varkala|Guruvayur|Sabarimala',
    'Goa': 'Anjuna|Calangute|Candolim|Mapusa|Margao|Panaji|Vasco da Gama',
    'West Bengal': 'Digha|Siliguri|Bardhaman|Asansol|Durgapur',
    'Delhi': 'Delhi|New Delhi|Karol Bagh|Connaught Place|Dwarka Sector 21',
    'Jammu and Kashmir': 'Gulmarg|Katra|Pahalgam|Sonamarg|Vaishno Devi',
    'Odisha': 'Bhubaneswar|Konark|Rourkela',
    'Bihar': 'Bodh Gaya|Rajgir|Nalanda Town|Sitamarhi Town',
    'Jharkhand': 'Jamshedpur|Baidyanath Dham',
    'Chhattisgarh': 'Bhilai|Jagdalpur',
    'Assam': 'Guwahati|Kaziranga|Silchar',
    'Andhra Pradesh': 'Tirumala|Vijayawada|Amaravati|Araku Valley',
    'Dadra and Nagar Haveli and Daman and Diu': 'Silvassa'
  };

  // ---- Airports --------------------------------------------------------
  var AIRPORTS = [
    ['Ahmedabad Airport (AMD)', 'Gujarat'], ['Surat Airport (STV)', 'Gujarat'],
    ['Vadodara Airport (BDQ)', 'Gujarat'], ['Rajkot Airport (HSR)', 'Gujarat'],
    ['Bhuj Airport (BHJ)', 'Gujarat'], ['Jamnagar Airport (JGA)', 'Gujarat'],
    ['Bhavnagar Airport (BHU)', 'Gujarat'], ['Porbandar Airport (PBD)', 'Gujarat'],
    ['Kandla Airport (IXY)', 'Gujarat'], ['Keshod Airport (IXK)', 'Gujarat'],
    ['Delhi Airport (DEL)', 'Delhi'], ['Mumbai Airport (BOM)', 'Maharashtra'],
    ['Pune Airport (PNQ)', 'Maharashtra'], ['Nagpur Airport (NAG)', 'Maharashtra'],
    ['Jaipur Airport (JAI)', 'Rajasthan'], ['Jodhpur Airport (JDH)', 'Rajasthan'],
    ['Udaipur Airport (UDR)', 'Rajasthan'], ['Jaisalmer Airport (JSA)', 'Rajasthan'],
    ['Indore Airport (IDR)', 'Madhya Pradesh'], ['Bhopal Airport (BHO)', 'Madhya Pradesh'],
    ['Goa Airport (GOI)', 'Goa'], ['Bengaluru Airport (BLR)', 'Karnataka'],
    ['Hyderabad Airport (HYD)', 'Telangana'], ['Chennai Airport (MAA)', 'Tamil Nadu'],
    ['Kolkata Airport (CCU)', 'West Bengal'], ['Kochi Airport (COK)', 'Kerala'],
    ['Lucknow Airport (LKO)', 'Uttar Pradesh'], ['Varanasi Airport (VNS)', 'Uttar Pradesh'],
    ['Amritsar Airport (ATQ)', 'Punjab'], ['Dehradun Airport (DED)', 'Uttarakhand']
  ];

  // ---- Alternate / older names ----------------------------------------
  var ALIASES = {
    'Ahmedabad': 'amdavad,karnavati',
    'Vadodara': 'baroda',
    'Mumbai': 'bombay',
    'Chennai': 'madras',
    'Kolkata': 'calcutta',
    'Bengaluru': 'bangalore,bangaluru',
    'Bengaluru Urban': 'bangalore urban',
    'Bengaluru Rural': 'bangalore rural',
    'Mysuru': 'mysore',
    'Pune': 'poona',
    'Prayagraj': 'allahabad',
    'Gurugram': 'gurgaon',
    'Kutch': 'kachchh,kutchh',
    'Chhatrapati Sambhajinagar': 'aurangabad',
    'Dharashiv': 'osmanabad',
    'Ahilyanagar': 'ahmednagar',
    'Kozhikode': 'calicut',
    'Thiruvananthapuram': 'trivandrum',
    'Kochi': 'cochin,ernakulam city',
    'Thrissur': 'trichur',
    'Puducherry': 'pondicherry,pondy',
    'Kalaburagi': 'gulbarga',
    'Ballari': 'bellary',
    'Belagavi': 'belgaum',
    'Shivamogga': 'shimoga',
    'Tumakuru': 'tumkur',
    'Vijayapura': 'bijapur',
    'Hubli': 'hubballi',
    'Mangaluru': 'mangalore',
    'Tiruchirappalli': 'trichy',
    'Thoothukudi': 'tuticorin',
    'Nilgiris': 'ooty district',
    'Ayodhya': 'faizabad',
    'Nashik': 'nasik',
    'Varanasi': 'banaras,kashi',
    'Narmadapuram': 'hoshangabad',
    'Statue of Unity': 'sou,kevadia',
    'Kevadiya': 'kevadia',
    'Somnath': 'prabhas patan',
    'Dwarka': 'dwarkadhish',
    'Vaishno Devi': 'katra vaishno devi',
    'Sri Ganganagar': 'ganganagar',
    'Gir Somnath': 'veraval district',
    'Devbhoomi Dwarka': 'dwarka district',
    'Mount Abu': 'abu',
    'Madhya Pradesh': 'mp',
    'Uttar Pradesh': 'up',
    'Andhra Pradesh': 'ap',
    'Himachal Pradesh': 'hp',
    'Arunachal Pradesh': 'ar',
    'Tamil Nadu': 'tn',
    'West Bengal': 'wb',
    'Maharashtra': 'mh',
    'Gujarat': 'gj',
    'Rajasthan': 'rj',
    'Karnataka': 'ka',
    'Kerala': 'kl',
    'Telangana': 'ts,tg',
    'Odisha': 'od,orissa',
    'Punjab': 'pb',
    'Haryana': 'hr',
    'Uttarakhand': 'uk,uttaranchal',
    'Chhattisgarh': 'cg',
    'Jharkhand': 'jh',
    'Bihar': 'br',
    'Assam': 'as',
    'Jammu and Kashmir': 'jk,j&k,kashmir',
    'Puducherry': 'pondicherry,pondy,py',
    'Delhi': 'new delhi,ncr,dl',
    'Gautam Buddha Nagar': 'noida district',
    'Panaji': 'panjim'
  };

  // ---- Build flat index ------------------------------------------------
  var list = [], seen = {};
  function push(name, type, state) {
    var key = name.toLowerCase();
    if (seen[key]) return;
    seen[key] = 1;
    list.push({ n: name, t: type, s: state || '', a: (ALIASES[name] || '') });
  }

  STATES.split('|').forEach(function (n) { push(n, S, ''); });
  UTS.split('|').forEach(function (n) { push(n, U, ''); });
  Object.keys(DISTRICTS).forEach(function (st) {
    DISTRICTS[st].split('|').forEach(function (n) { push(n, D, st); });
  });
  Object.keys(CITIES).forEach(function (st) {
    CITIES[st].split('|').forEach(function (n) { push(n, C, st); });
  });
  AIRPORTS.forEach(function (r) { push(r[0], A, r[1]); });

  // pre-compute lowercase haystacks
  list.forEach(function (o) {
    o.ln = o.n.toLowerCase();
    o.words = o.ln.split(/[\s\-]+/);
    o.la = o.a ? o.a.split(',') : [];
  });

  window.AAC_LOCATIONS = list;
})();
