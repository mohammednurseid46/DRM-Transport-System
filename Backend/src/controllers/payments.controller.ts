import { Request, Response } from 'express';
import prisma from '../config/db.js';
import { AuthRequest } from '../middleware/auth.middleware.js';

export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { ride_passenger_id, amount, payment_method, transaction_ref } = req.body;

    const ridePassenger = await prisma.ridePassenger.findUnique({
      where: { ride_passenger_id }
    });

    if (!ridePassenger) {
      return res.status(404).json({ message: 'Passenger record not found for this ride' });
    }

    // Record the payment
    const payment = await prisma.payment.create({
      data: {
        ride_passenger_id,
        amount,
        payment_method,
        transaction_ref,
        payment_status: 'COMPLETED' // Simplified for demo. Real logic would involve webhook callbacks for digital payments.
      }
    });

    // Update ride passenger status
    await prisma.ridePassenger.update({
      where: { ride_passenger_id },
      data: { payment_status: 'COMPLETED' }
    });

    res.status(200).json({ message: 'Payment confirmed successfully', payment });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
