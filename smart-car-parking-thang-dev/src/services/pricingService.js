let pricing = {
  Car:        { firstHour: 2,   additionalHour: 1.5,  dailyMax: 15 },
  Motorcycle: { firstHour: 1,   additionalHour: 0.75, dailyMax: 8  },
  Truck:      { firstHour: 3,   additionalHour: 2,    dailyMax: 20 }
};

exports.getPrice = () => pricing;

exports.setPrice = (newPricing) => { pricing = newPricing; };

exports.calculateFee = (ticket) => {
  const now = new Date();
  const diffHours = Math.ceil((now - new Date(ticket.enterTime)) / (1000 * 60 * 60));
  const p = pricing[ticket.vehicleType || 'Car'];

  if (diffHours <= 1) return p.firstHour;
  const fee = p.firstHour + (diffHours - 1) * p.additionalHour;
  return fee > p.dailyMax ? p.dailyMax : fee;
};
