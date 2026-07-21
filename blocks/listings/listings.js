/*
 * Listings block
 * Fetches listing data from the Salesforce-backed /api/listings endpoint
 * (proxied via CDN -> Salesforce Apex facade -> client API).
 *
 * POC MODE: USE_MOCK is set to true so this renders without a live
 * backend. Once the Salesforce endpoint + CDN routing are ready,
 * flip USE_MOCK to false and update API_ENDPOINT if needed.
 */

const API_ENDPOINT = '/api/listings';
const USE_MOCK = true; // <-- flip to false when Salesforce endpoint is live

export default async function decorate(block) {
  // Clear any authored placeholder content
  block.textContent = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'listings-wrapper';
  wrapper.innerHTML = '<p class="listings-status">Loading listings…</p>';
  block.append(wrapper);

  // eslint-disable-next-line no-use-before-define
  const listings = await fetchListings();
  // eslint-disable-next-line no-use-before-define
  renderListings(wrapper, listings);
}

async function fetchListings() {
  if (USE_MOCK) {
    // Simulate network latency so loading state is visible in the demo
    await new Promise((resolve) => { setTimeout(resolve, 500); });
    // eslint-disable-next-line no-use-before-define
    return getMockListings();
  }

  try {
    const res = await fetch(API_ENDPOINT, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Listings API responded with ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch listings, falling back to mock data:', err);
    // eslint-disable-next-line no-use-before-define
    return getMockListings();
  }
}

function renderListings(wrapper, listings) {
  wrapper.innerHTML = '';

  if (!listings || listings.length === 0) {
    wrapper.innerHTML = '<p class="listings-status listings-empty">No listings found.</p>';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'listings-grid';

  listings.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
      <div class="listing-card-image">
        <img src="${item.image}" alt="${item.title}" loading="lazy" />
      </div>
      <div class="listing-card-body">
        <h3 class="listing-title">${item.title}</h3>
        <p class="listing-location">${item.location}</p>
        <p class="listing-price">${item.price}</p>
        <span class="listing-source">Source: ${item.source || 'Unknown'}</span>
      </div>
    `;
    grid.append(card);
  });

  wrapper.append(grid);
}

function getMockListings() {
  // Deliberately shaped like the NORMALIZED response the Apex facade
  // would return -- same shape regardless of which client API answered.
  return [
    {
      id: 'L-1001',
      title: '3BHK Apartment, Sector 21',
      location: 'Gurugram, Haryana',
      price: '₹85,00,000',
      image: 'https://placehold.co/400x260?text=Listing+1',
      source: 'Client A',
    },
    {
      id: 'L-1002',
      title: '2BHK Flat, Whitefield',
      location: 'Bengaluru, Karnataka',
      price: '₹62,50,000',
      image: 'https://placehold.co/400x260?text=Listing+2',
      source: 'Client B',
    },
    {
      id: 'L-1003',
      title: 'Independent Villa, Jubilee Hills',
      location: 'Hyderabad, Telangana',
      price: '₹2,10,00,000',
      image: 'https://placehold.co/400x260?text=Listing+3',
      source: 'Client A',
    },
    {
      id: 'L-1004',
      title: 'Studio Apartment, Powai',
      location: 'Mumbai, Maharashtra',
      price: '₹48,00,000',
      image: 'https://placehold.co/400x260?text=Listing+4',
      source: 'Client B',
    },
  ];
}
