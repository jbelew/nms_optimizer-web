import fetch from 'node-fetch';

const API_URL = 'https://nms-optimizer-service-afebcfd47e2a.herokuapp.com/';

export async function getShipTypes() {
  try {
    const response = await fetch(`${API_URL}platforms`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching ship types:', error);
    return null;
  }
}

export async function getTechTree(techTreeId) {
  try {
    const response = await fetch(`${API_URL}tech_tree/${techTreeId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching tech tree ${techTreeId}:`, error);
    return null;
  }
}
