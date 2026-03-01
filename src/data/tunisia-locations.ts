export const governorates = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
  'Béja', 'Jendouba', 'Le Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
  'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Médenine',
  'Tataouine', 'Gafsa', 'Tozeur', 'Kébili'
] as const

export type Governorate = typeof governorates[number]

export const boutiqueColors = ['#f97316', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444', '#ec4899', '#6366f1', '#14b8a6']

export type DelegationData = { localities: string[]; postalCode: string }
export type GouvernoratData = { delegations: Record<string, DelegationData> }

export const tunisiaLocations: Record<string, GouvernoratData> = {
  'Tunis': {
    delegations: {
      'Tunis Ville': { localities: ['Centre Ville', 'Bab Bhar', 'Bab Souika'], postalCode: '1000' },
      'Le Bardo': { localities: ['Le Bardo', 'Khaznadar'], postalCode: '2000' },
      'La Marsa': { localities: ['La Marsa', 'Sidi Bou Said', 'Gammarth'], postalCode: '2078' },
      'Carthage': { localities: ['Carthage', 'Carthage Byrsa', 'Carthage Dermech'], postalCode: '2016' },
      'Ariana': { localities: ['Ariana Ville', 'Soukra', 'Raoued'], postalCode: '2080' }
    }
  },
  'Ariana': {
    delegations: {
      'Ariana Ville': { localities: ['Ariana Centre', 'Menzah 5', 'Menzah 6'], postalCode: '2080' },
      'Soukra': { localities: ['Soukra', 'Ain Zaghouan'], postalCode: '2036' },
      'Raoued': { localities: ['Raoued', 'Borj Louzir'], postalCode: '2083' },
      'Mnihla': { localities: ['Mnihla', 'Ettadhamen'], postalCode: '2042' }
    }
  },
  'Ben Arous': {
    delegations: {
      'Ben Arous': { localities: ['Ben Arous Centre', 'Mourouj 1', 'Mourouj 2'], postalCode: '2013' },
      'Hammam Lif': { localities: ['Hammam Lif', 'Hammam Chatt'], postalCode: '2050' },
      'Radès': { localities: ['Radès', 'Radès Plage'], postalCode: '2040' },
      'Mégrine': { localities: ['Mégrine', 'Mégrine Riadh'], postalCode: '2033' }
    }
  },
  'Manouba': {
    delegations: {
      'Manouba': { localities: ['Manouba Centre', 'Denden'], postalCode: '2010' },
      'Oued Ellil': { localities: ['Oued Ellil', 'Cité Ibn Khaldoun'], postalCode: '2021' },
      'Tebourba': { localities: ['Tebourba', 'El Battan'], postalCode: '1130' },
      'Douar Hicher': { localities: ['Douar Hicher'], postalCode: '2086' }
    }
  },
  'Nabeul': {
    delegations: {
      'Nabeul': { localities: ['Nabeul Centre', 'Dar Chaabane'], postalCode: '8000' },
      'Hammamet': { localities: ['Hammamet', 'Hammamet Sud', 'Yasmine Hammamet'], postalCode: '8050' },
      'Korba': { localities: ['Korba', 'Tazerka'], postalCode: '8070' },
      'Kelibia': { localities: ['Kelibia', 'Hammam Ghezaz'], postalCode: '8090' }
    }
  },
  'Zaghouan': {
    delegations: {
      'Zaghouan': { localities: ['Zaghouan Centre', 'Mograne'], postalCode: '1100' },
      'Zriba': { localities: ['Zriba', 'Hammam Zriba'], postalCode: '1121' },
      'Bir Mcherga': { localities: ['Bir Mcherga'], postalCode: '1141' }
    }
  },
  'Bizerte': {
    delegations: {
      'Bizerte Nord': { localities: ['Bizerte', 'Corniche'], postalCode: '7000' },
      'Bizerte Sud': { localities: ['Zarzouna', 'Menzel Jemil'], postalCode: '7003' },
      'Menzel Bourguiba': { localities: ['Menzel Bourguiba', 'Tinja'], postalCode: '7050' },
      'Mateur': { localities: ['Mateur', 'Joumine'], postalCode: '7030' }
    }
  },
  'Béja': {
    delegations: {
      'Béja Nord': { localities: ['Béja Centre', 'Zahret Medien'], postalCode: '9000' },
      'Béja Sud': { localities: ['Béja Sud'], postalCode: '9000' },
      'Medjez el-Bab': { localities: ['Medjez el-Bab', 'Oued Zarga'], postalCode: '9070' },
      'Testour': { localities: ['Testour', 'Slouguia'], postalCode: '9060' }
    }
  },
  'Jendouba': {
    delegations: {
      'Jendouba': { localities: ['Jendouba Centre', 'Bousalem'], postalCode: '8100' },
      'Tabarka': { localities: ['Tabarka', 'Aïn Draham'], postalCode: '8110' },
      'Ghardimaou': { localities: ['Ghardimaou'], postalCode: '8160' }
    }
  },
  'Le Kef': {
    delegations: {
      'Le Kef Ouest': { localities: ['Le Kef', 'Es Sers'], postalCode: '7100' },
      'Le Kef Est': { localities: ['Le Kef Est'], postalCode: '7100' },
      'Dahmani': { localities: ['Dahmani', 'Ksour'], postalCode: '7170' }
    }
  },
  'Siliana': {
    delegations: {
      'Siliana Nord': { localities: ['Siliana', 'Bourouis'], postalCode: '6100' },
      'Siliana Sud': { localities: ['Siliana Sud'], postalCode: '6100' },
      'Makthar': { localities: ['Makthar', 'Kesra'], postalCode: '6140' }
    }
  },
  'Sousse': {
    delegations: {
      'Sousse Ville': { localities: ['Sousse Centre', 'Sousse Médina'], postalCode: '4000' },
      'Sousse Jawhara': { localities: ['Sousse Jawhara', 'Khezama'], postalCode: '4051' },
      'Sousse Riadh': { localities: ['Sousse Riadh', 'Sahloul'], postalCode: '4054' },
      'Hammam Sousse': { localities: ['Hammam Sousse'], postalCode: '4011' },
      'Msaken': { localities: ['Msaken', 'Kalaa Kébira'], postalCode: '4070' }
    }
  },
  'Monastir': {
    delegations: {
      'Monastir': { localities: ['Monastir Centre', 'Skanes'], postalCode: '5000' },
      'Moknine': { localities: ['Moknine', 'Téboulba'], postalCode: '5050' },
      'Ksar Hellal': { localities: ['Ksar Hellal'], postalCode: '5070' },
      'Jemmal': { localities: ['Jemmal', 'Menzel Kamel'], postalCode: '5020' }
    }
  },
  'Mahdia': {
    delegations: {
      'Mahdia': { localities: ['Mahdia Centre', 'Rejiche'], postalCode: '5100' },
      'Ksour Essef': { localities: ['Ksour Essef', 'El Jem'], postalCode: '5180' },
      'Chebba': { localities: ['Chebba', 'Melloulech'], postalCode: '5170' }
    }
  },
  'Sfax': {
    delegations: {
      'Sfax Ville': { localities: ['Sfax Centre', 'Médina'], postalCode: '3000' },
      'Sfax Ouest': { localities: ['Sfax Ouest', 'Sakiet Eddaier'], postalCode: '3002' },
      'Sfax Sud': { localities: ['Sfax Sud', 'Thyna'], postalCode: '3041' },
      'Sakiet Ezzit': { localities: ['Sakiet Ezzit', 'Chihia'], postalCode: '3021' },
      'Bir Ali Ben Khalifa': { localities: ['Bir Ali Ben Khalifa'], postalCode: '3040' }
    }
  },
  'Kairouan': {
    delegations: {
      'Kairouan Nord': { localities: ['Kairouan Centre', 'Médina'], postalCode: '3100' },
      'Kairouan Sud': { localities: ['Kairouan Sud', 'Chbika'], postalCode: '3100' },
      'Sbikha': { localities: ['Sbikha', 'Haffouz'], postalCode: '3160' }
    }
  },
  'Kasserine': {
    delegations: {
      'Kasserine Nord': { localities: ['Kasserine', 'Cité Ezzouhour'], postalCode: '1200' },
      'Kasserine Sud': { localities: ['Kasserine Sud'], postalCode: '1200' },
      'Sbeitla': { localities: ['Sbeitla', 'Jedeliane'], postalCode: '1250' },
      'Thala': { localities: ['Thala', 'Foussana'], postalCode: '1210' }
    }
  },
  'Sidi Bouzid': {
    delegations: {
      'Sidi Bouzid Ouest': { localities: ['Sidi Bouzid', 'Bir El Hafey'], postalCode: '9100' },
      'Sidi Bouzid Est': { localities: ['Sidi Bouzid Est'], postalCode: '9100' },
      'Regueb': { localities: ['Regueb', 'Mezzouna'], postalCode: '9170' }
    }
  },
  'Gabès': {
    delegations: {
      'Gabès Ville': { localities: ['Gabès Centre', 'Jara'], postalCode: '6000' },
      'Gabès Sud': { localities: ['Gabès Sud', 'Chenini'], postalCode: '6011' },
      'El Hamma': { localities: ['El Hamma', 'El Metouia'], postalCode: '6020' },
      'Mareth': { localities: ['Mareth', 'Zarat'], postalCode: '6044' }
    }
  },
  'Médenine': {
    delegations: {
      'Médenine Nord': { localities: ['Médenine', 'Médenine Nord'], postalCode: '4100' },
      'Médenine Sud': { localities: ['Médenine Sud'], postalCode: '4100' },
      'Ben Guerdane': { localities: ['Ben Guerdane'], postalCode: '4160' },
      'Zarzis': { localities: ['Zarzis', 'Souihel'], postalCode: '4170' },
      'Djerba Houmt Souk': { localities: ['Houmt Souk', 'Midoun'], postalCode: '4180' }
    }
  },
  'Tataouine': {
    delegations: {
      'Tataouine Nord': { localities: ['Tataouine', 'Tataouine Nord'], postalCode: '3200' },
      'Tataouine Sud': { localities: ['Tataouine Sud', 'Remada'], postalCode: '3200' },
      'Ghomrassen': { localities: ['Ghomrassen', 'Ksar Ouled Soltane'], postalCode: '3221' }
    }
  },
  'Gafsa': {
    delegations: {
      'Gafsa Nord': { localities: ['Gafsa', 'Gafsa Nord'], postalCode: '2100' },
      'Gafsa Sud': { localities: ['Gafsa Sud', 'El Ksar'], postalCode: '2100' },
      'Métlaoui': { localities: ['Métlaoui', 'Mdhilla'], postalCode: '2130' },
      'Redeyef': { localities: ['Redeyef', 'Moulares'], postalCode: '2120' }
    }
  },
  'Tozeur': {
    delegations: {
      'Tozeur': { localities: ['Tozeur', 'Bled El Hadhar'], postalCode: '2200' },
      'Nefta': { localities: ['Nefta', 'Hazoua'], postalCode: '2240' },
      'Degache': { localities: ['Degache', 'Hamet Jerid'], postalCode: '2260' }
    }
  },
  'Kébili': {
    delegations: {
      'Kébili Nord': { localities: ['Kébili', 'Kébili Nord'], postalCode: '4200' },
      'Kébili Sud': { localities: ['Kébili Sud', 'Jemna'], postalCode: '4200' },
      'Douz': { localities: ['Douz', 'Zaafrane'], postalCode: '4260' },
      'Souk Lahad': { localities: ['Souk Lahad'], postalCode: '4230' }
    }
  }
}
