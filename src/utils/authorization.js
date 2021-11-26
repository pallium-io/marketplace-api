// middleware for doing role-based permissions
export default function permit({ isAuthenticated = false, permittedRoles = [] }) {
  // return a middleware
  return (request, response, next) => {
    const user = request.user || null;
    console.log('user: ', user);
    if (user && isAuthenticated && !permittedRoles.length) {
      next();
    } else if (user && isAuthenticated && permittedRoles.includes(user.role)) {
      next(); // role is allowed, so continue on the next middleware
    } else {
      response.status(403).json({ message: 'Forbidden' }); // user is forbidden
    }
  };
}
