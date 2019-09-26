Rails.application.routes.draw do
  mount Sidekiq::Web => "/sidekiq" # monitoring console

  root "home#index"

  get "philosophy" => "home#philosophy"

  get "contact" => "home#contact"

  get "solutions" => "home#solutions"

  get "labratory" => "home#labratory"

end
