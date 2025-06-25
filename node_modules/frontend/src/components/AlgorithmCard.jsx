import { useState } from "react";
import { motion } from 'framer-motion';
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "./ui/dialog"

const buttonHoverTap = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 }
}

export default function AlgorithmCard({ icon, name, description, details }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  return (
    <motion.div whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}>
      <Card className="flex flex-col justify-between text-center h-full bg-card/80 backdrop-blur-sm border-white/10 shadow-2xl hover:border-primary/50 transition-all duration-300">
        <CardHeader>
          <div className="mx-auto bg-primary/20 text-primary p-4 rounded-full mb-4">
            {icon}
          </div>
          <CardTitle className="text-xl font-bold">{name}</CardTitle>
          <CardDescription className="text-muted-foreground mt-2 min-h-[6rem]">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Additional content can go here if needed */}
        </CardContent>
        <CardFooter className="flex justify-center pt-0">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <motion.div whileHover="hover" whileTap="tap" variants={buttonHoverTap}>
                <Button variant="outline" className="bg-transparent hover:bg-primary hover:text-primary-foreground">Learn More</Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-md border-white/10">
              <DialogHeader>
                <DialogTitle className="text-2xl text-primary">
                  {name}
                </DialogTitle>
                <DialogDescription className="pt-4 text-left text-base text-muted-foreground">
                  {details}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                  <DialogClose asChild>
                    <motion.div whileHover="hover" whileTap="tap" variants={buttonHoverTap}>
                      <Button className="w-full">Close</Button>
                    </motion.div>
                  </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardFooter>
      </Card>
    </motion.div>
  )
} 