/**
 * Mock AI Service for Event Analytics
 * In a real system, this would connect to a Python ML service or Tensorflow.js model.
 */

exports.predictAttendance = (eventData) => {
    // Simple heuristic-based prediction
    // Factors: Ticket price, category popularity, days until event, previous organizer success
    const baseRate = 0.6; // 60% base attendance
    const priceFactor = eventData.price > 500 ? -0.1 : 0.1;
    const categoryFactor = ['Concert', 'Fest'].includes(eventData.category) ? 0.2 : 0;

    let prediction = (baseRate + priceFactor + categoryFactor) * eventData.capacity;
    return Math.floor(Math.max(prediction, 0));
};

exports.calculateRiskScore = (eventData, currentRegistrations) => {
    // Risk of overcrowding or logistics failure
    // Returns 0-100 (High score = High Risk)

    /* 
       Logic:
       1. Density: Registrations / Venue Capacity
       2. Velocity: Registrations per hour
    */

    const capacity = eventData.capacity || 1000; // Default capacity if not set
    const density = currentRegistrations / capacity;

    let risk = density * 50; // Base risk on density

    if (density > 1.1) risk += 30; // Overbooking risk

    return Math.min(Math.round(risk), 100);
};
