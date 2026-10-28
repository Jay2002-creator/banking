import { auth } from '@/auth.js';
import { successResponse, errorResponse } from '@/utils/api-response.js';
import { hasPermission } from '@/utils/rbac.js';
import { AppError } from '@/utils/error-handler.js';
import dbConnect from '@/lib/mongodb.js';
import LoanApplication from '@/models/LoanApplication.js';

export async function GET(req) {
  try {
    await dbConnect();
    const session = await auth();
    if (!session) {
      throw AppError.unauthorized('You must be logged in.');
    }
    if (!hasPermission(session, 'loan.apply') && !hasPermission(session, 'loan.view') && session.user?.roleCode !== 'SUPER_ADMIN') {
      throw AppError.forbidden('Insufficient permissions');
    }

    const year = new Date().getFullYear();
    const allMatchingApps = await LoanApplication.find({
      applicationNo: new RegExp(`^LA-${year}-\\d+$`)
    }, { applicationNo: 1 });

    let maxNum = 0;
    for (const a of allMatchingApps) {
      const parts = a.applicationNo.split('-');
      const num = parseInt(parts[2], 10);
      if (!isNaN(num) && num > maxNum) {
        maxNum = num;
      }
    }
    const nextNum = maxNum + 1;
    const nextCode = `LA-${year}-${String(nextNum).padStart(6, '0')}`;

    return successResponse({ nextCode }, 200);
  } catch (error) {
    return errorResponse(error);
  }
}

