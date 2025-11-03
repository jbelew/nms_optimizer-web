# Stage 1: Build Frontend (nms_optimizer-web)
ARG BUILDPLATFORM
FROM --platform=$BUILDPLATFORM node:22-alpine AS frontend-builder
WORKDIR /app/frontend

# Copy frontend specific files from nms_optimizer-web directory (relative to build context)
COPY package.json \
     package-lock.json \
     tsconfig.json \
     vite.config.ts \
     ./
RUN npm ci --ignore-scripts

# Copy the rest of the frontend source
COPY . ./

RUN npm run build:docker # Assumes output to /app/frontend/dist

# Stage 2: Prepare Backend (nms_optimizer-service from GitHub)
FROM --platform=$BUILDPLATFORM python:3.14-slim AS backend-builder
ARG TARGETARCH
WORKDIR /app/backend

# Install git, build dependencies, Rust, and maturin
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    build-essential \
    curl \
    && pip install --no-cache-dir wheel maturin \
    && curl https://sh.rustup.rs -sSf | sh -s -- -y \
    && rm -rf /var/lib/apt/lists/*
RUN arch

ENV PATH="/root/.cargo/bin:${PATH}"
RUN arch

# Clone the backend repository
ARG BACKEND_REPO_URL=https://github.com/jbelew/nms_optimizer-service.git
ARG BACKEND_REPO_BRANCH=main # Or a specific commit/tag
RUN echo "Attempting to clone backend repository..." && \
    git clone --branch ${BACKEND_REPO_BRANCH} --depth 1 ${BACKEND_REPO_URL} . && \
    rm -rf .git && \
    echo "--- Contents of /app/backend after clone: ---" && \
    ls -la /app/backend/ && \
    echo "--- Contents of /app/backend/requirements.txt: ---" && \
    cat /app/backend/requirements.txt || echo "Failed to cat requirements.txt"

ARG MATURIN_TARGET
RUN if [ "${TARGETARCH}" = "amd64" ]; then MATURIN_TARGET="x86_64-unknown-linux-gnu"; \
    elif [ "${TARGETARCH}" = "arm64" ]; then MATURIN_TARGET="aarch64-unknown-linux-gnu"; \
    else echo "Unsupported TARGETARCH: ${TARGETARCH}" && exit 1; fi && \
    echo "MATURIN_TARGET: ${MATURIN_TARGET}"

# Build wheels for Python dependencies
RUN mkdir /app/wheels && \
    echo "--- Building nms_optimizer_service wheel with maturin ---" && \
    (cd rust_scorer && maturin build --release -o /app/wheels --target ${MATURIN_TARGET}) && \
    echo "--- Building dependency wheels ---" && \
    # Create a temporary requirements file without the nms_optimizer_service wheel
    grep -v "nms_optimizer_service" requirements.txt > requirements.tmp.txt && \
    pip wheel --no-cache-dir -r requirements.tmp.txt -w /app/wheels && \
    echo "--- Successfully built all wheels. Contents of /app/wheels: ---" && \
    ls -la /app/wheels/ || \
    (echo "!!! Pip wheel command failed. Check errors above. !!!" && exit 1)

# Stage 2.5: Install backend dependencies into a clean environment
FROM python:3.14-slim AS backend-deps-installer
WORKDIR /deps

# Copy wheels and requirements.txt from the backend-builder stage
COPY --from=backend-builder /app/wheels /tmp/wheels
COPY --from=backend-builder /app/backend/requirements.tmp.txt .
COPY --from=backend-builder /app/backend/wheelhouse ./wheelhouse

# Install dependencies from requirements.txt using the pre-built wheels
RUN pip install --no-cache-dir --no-index --find-links=/tmp/wheels -r requirements.tmp.txt && \
    pip install --no-cache-dir --no-index --find-links=/tmp/wheels /tmp/wheels/*.whl && \
    rm -rf /tmp/wheels
# At this point, /usr/local/lib/python3.11/site-packages contains the installed dependencies

# Stage 3: Final Image with Nginx, Frontend, and Backend Service (was Stage 3)
FROM python:3.14-slim
LABEL maintainer="jbelew.dev@gmail.com"
LABEL description="NMS Optimizer Web UI and Python Backend Service"

ENV PYTHONUNBUFFERED=1 \
    APP_USER=appuser \
    APP_GROUP=appgroup

# Create a non-root user for running the application
RUN groupadd -r ${APP_GROUP} && useradd -r -g ${APP_GROUP} -d /opt/app -s /sbin/nologin ${APP_USER}

# Install Nginx, supervisor, and Gunicorn
RUN apt-get update && apt-get install -y --no-install-recommends \
    nginx \
    supervisor \
    && pip install --no-cache-dir gunicorn gevent \
    && apt-get purge -y --auto-remove -o APT::AutoRemove::RecommendsImportant=false \
    && rm -rf /var/lib/apt/lists/*

# Create necessary directories and set permissions
RUN mkdir -p /opt/app/frontend_dist \
               /opt/app/backend_app \
               /var/log/supervisor \
               /var/log/nginx \
               /run/nginx \
               /var/run/supervisor && \
    chown -R ${APP_USER}:${APP_GROUP} /opt/app && \
    # Nginx runs as www-data on Debian for these paths
    chown -R www-data:www-data /var/log/nginx /run/nginx && \
    chmod 755 /run/nginx && \
    chown root:root /var/run/supervisor # Supervisor pid file

WORKDIR /opt/app

# Copy built frontend from frontend-builder stage
COPY --from=frontend-builder --chown=${APP_USER}:${APP_GROUP} /app/frontend/dist /opt/app/frontend_dist

# Copy backend application source code from backend-builder stage
# IMPORTANT: Be specific here to avoid copying .git or other unnecessary files/folders.
# Copy requirements.txt first (though it's not strictly needed if site-packages are copied, it's good for reference)
COPY --from=backend-builder --chown=${APP_USER}:${APP_GROUP} /app/backend/requirements.txt /opt/app/backend_app/requirements.txt

# Copy the entire backend source and scripts directories
COPY --from=backend-builder --chown=${APP_USER}:${APP_GROUP} /app/backend/src /opt/app/backend_app/src
COPY --from=backend-builder --chown=${APP_USER}:${APP_GROUP} /app/backend/scripts /opt/app/backend_app/scripts

# Copy installed Python dependencies (site-packages) from the backend-deps-installer stage
COPY --from=backend-deps-installer /usr/local/lib/python3.14/site-packages /usr/local/lib/python3.14/site-packages
# Copy any executables installed by pip (e.g., if gunicorn was in requirements.txt)
COPY --from=backend-deps-installer /usr/local/bin /usr/local/bin

# Copy Nginx site configuration (assumes docker_configs directory is at the root of the build context)
COPY docker_configs/app.nginx.conf /etc/nginx/conf.d/default.conf
# Ensure any default site from sites-enabled is removed to avoid conflicts if Nginx package installed one
RUN rm -f /etc/nginx/sites-enabled/default

# Copy Supervisor configuration
COPY docker_configs/supervisord.conf /etc/supervisor/supervisord.conf

EXPOSE 80
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/supervisord.conf"]
