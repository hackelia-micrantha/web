FROM  ruby:2.5.5-alpine

MAINTAINER Ryan Jennings <ryan@micrantha.com>

RUN gem install bundler

COPY . /app

WORKDIR /app

RUN bundle install --without development test

ENV RAILS_ENV production

CMD ["bundle", "exec", "unicorn", "-p", "$PORT"]
