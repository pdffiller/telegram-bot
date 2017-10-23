//
//template {
//  source = "dockerfiles/jsfiller3/templates/nginx.ctmpl"
//  destination = "/etc/nginx/sites-enabled/jsfiller.conf"
//
//  command = "service nginx reload"
//}
//
//template {
//  source = "dockerfiles/jsfiller3/templates/pm2.ctmpl"
//  destination = "./config/pm2.json"
//
//  command = "service nginx reload"
//}