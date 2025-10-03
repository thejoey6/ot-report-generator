import jwt from 'jsonwebtoken';

function generateToken(userId, email) {
  const accessToken = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRY,
  });

  return { accessToken, refreshToken };
}

export default generateToken;