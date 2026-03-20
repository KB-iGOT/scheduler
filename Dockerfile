FROM node:16

# Create non-root user
RUN useradd -m appuser

# Set working directory
WORKDIR /var/src/

# Give permission to the non-root user
RUN chown -R appuser:appuser /var/src

# Switch to the non-root user
USER appuser

# Copy package.json first (better caching)
COPY --chown=appuser:appuser ./src/package.json .

# Install node packages (global installs must run as root → switch temporarily)
USER root
RUN npm install && npm install -g nodemon@2.0.16 && npm i is-stream

# Switch back to non-root user
USER appuser

# Copy all other files
COPY --chown=appuser:appuser ./src .

# Expose the application port
EXPOSE 4000

# Start the application
CMD ["node", "app.js"]
